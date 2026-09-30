<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // 1. GLOBAL WEB APPENDS (Inertia shared state initialization)
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // 2. ROUTE ALIASES (Your custom password reset wall)
        $middleware->alias([
            'force_reset' => \App\Http\Middleware\EnforcePasswordReset::class,
        ]);

        // 3. GUEST REDIRECTION RULE (Pushes unauthenticated users explicitly back to root)
        $middleware->redirectTo(guests: '/');
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // 1. NORMALIZATION LAYER: Force raw core Policy failures into real HTTP exceptions
        $exceptions->map(AuthorizationException::class, function (AuthorizationException $e) {
            return new AccessDeniedHttpException($e->getMessage() ?: 'Forbidden Access Matrix.', $e);
        });

        // 2. RENDERING LAYER: Intercept and build custom error states
        $exceptions->render(function (Throwable $e, Request $request) {

            // EXCLUSION GUARD MATRIX: Let Validation and Auth bypass this custom rendering
            if (
                $e instanceof \Illuminate\Auth\AuthenticationException ||
                $e instanceof \Illuminate\Validation\ValidationException
            ) {
                return null;
            }

            // Determine the HTTP Status Code (e.g., 404, 403, or 500 for database insertion failures)
            $statusCode = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
            $officialStatusText = \Symfony\Component\HttpFoundation\Response::$statusTexts[$statusCode] ?? 'Unknown';

            // If APP_DEBUG is true and it's a server crash (500), crash normally to see the native stack trace
            if (config('app.debug') && $statusCode === 500) {
                return null;
            }

            // --- TELEMETRY CALCULATIONS ---
            $isDebug = config('app.debug');
            $dynamicOperation = $request->method() . '_REQUEST';

            // Status text is the only thing safe to show in production.
            // $e->getMessage() is developer/framework text: model names, IDs, SQL.
            $statusSlug = strtoupper(str_replace(' ', '_', $officialStatusText));

            if ($isDebug) {
                // Local dev: keep the detailed view you had
                $path = $request->path();
                $dynamicTarget = $path === '/'
                    ? 'ROOT_CORE'
                    : \Illuminate\Support\Str::limit(strtoupper(str_replace(['/', '-'], '_', $path)), 25, '...');
                $rawMessage = $e->getMessage() ?: $officialStatusText;
                $location = 'NODE_' . $request->ip();
                $telemetryData = [
                    'МАРШРУТ СБОЯ: ' . $request->method() . ' ' . \Illuminate\Support\Str::limit($request->fullUrl(), 45, '...'),
                    'СТАТУС ОТВЕТА: ' . $statusCode . ' (' . $statusSlug . ')',
                    'ВРЕМЯ ФИКСАЦИИ: ' . now()->toIso8601String(),
                    'IP-АДРЕС ИСТОЧНИКА: ' . $request->ip(),
                ];
            } else {
                // Production: fixed strings only, nothing derived from the request or exception
                $dynamicTarget = '...';
                $rawMessage = $statusSlug;
                $location = 'ВНЕ_ЗОНЫ_ДОСТУПА';
                $telemetryData = [
                    'СТАТУС ОТВЕТА: ' . $statusCode . ' (' . $statusSlug . ')',
                    // Timestamp is harmless and lets you find the matching log line
                    'ВРЕМЯ ФИКСАЦИИ: ' . now()->toIso8601String(),
                    'РЕКОМЕНДАЦИЯ: ВЕРНУТЬСЯ НА БАЗУ',
                ];
            }

            $dynamicStatus = ($statusCode === 403 || $statusCode === 401) ? 'ДОСТУП_БЛОКИРОВАН' : (($statusCode >= 500) ? 'КРИТИЧЕСКИЙ_СБОЙ_ЯДРА' : '...');
            $shortenedMessage = \Illuminate\Support\Str::limit($rawMessage, 50, '...');

            // --- INERTIA APP GUARD ---
            // If the request comes from Inertia, compile payload and dispatch cleanly to a frontend page
            if ($request->header('X-Inertia')) {
                return Inertia::render('Error', [
                    'code' => $statusCode,
                    'rawMessage' => $rawMessage,
                    'message' => $shortenedMessage,
                    'operation' => $dynamicOperation,
                    'status' => $dynamicStatus,
                    'target' => $dynamicTarget,
                    'location' => 'NODE_' . $request->ip(),
                    'telemetry' => $telemetryData,
                ])->toResponse($request)->setStatusCode($statusCode);
            }

            // --- STANDARD BLADE FALLBACK MATRIX (Direct URL visits) ---
            $viewName = view()->exists("errors.{$statusCode}") ? "errors.{$statusCode}" : 'errors.minimal';

            try {
                // Try rendering your custom code blade layout (e.g. errors.404)
                return response()->view($viewName, [
                    'code' => $statusCode,
                    'rawMessage' => $rawMessage,
                    'message' => $shortenedMessage,
                    'operation' => $dynamicOperation,
                    'status' => $dynamicStatus,
                    'target' => $dynamicTarget,
                    'location' => 'NODE_' . $request->ip(),
                    'telemetry' => $telemetryData,
                ], $statusCode);
            } catch (\Throwable $viewException) {
                // Custom view crashed: fall back to errors.minimal.
                // report() writes the real exception (with file paths) to laravel.log,
                // so you can still debug it without exposing it to the browser.
                report($viewException);

                // Only show the compile error in debug mode: in production the message
                // contains file paths and view internals.
                $telemetry = $isDebug
                    ? array_merge($telemetryData, [
                        'ОШИБКА_КОМПИЛЯЦИИ: ' . \Illuminate\Support\Str::limit($viewException->getMessage(), 35),
                    ])
                    : $telemetryData;

                return response()->view('errors.minimal', [
                    'code' => $statusCode,
                    'rawMessage' => $rawMessage,
                    'message' => $shortenedMessage,
                    'operation' => $dynamicOperation,
                    'status' => $dynamicStatus,
                    'target' => $dynamicTarget,
                    'location' => $location, // was 'NODE_' . $request->ip()
                    'telemetry' => $telemetry,
                ], $statusCode);
            }
        });
    })
    ->create();
