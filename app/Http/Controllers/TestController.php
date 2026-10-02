<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
/////////////////////////////////////////////
use App\Http\Requests\Test\TestStoreRequest;
use App\Http\Requests\Test\TestUpdateRequest;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Repositories\TestAttemptRepository;
use App\Services\TestService;
use App\Models\Setting;

class TestController extends Controller
{
    public function index(Request $request, TestAttemptRepository $repo)
    {
        $userId = Auth::id();
        $activeTab = $request->query('tab', 'available');

        // dd($repo->getPassedTests($userId));

        return Inertia::render('Test/Index', [
            'active_tab' => $activeTab,

            'available_tests' => $activeTab === 'available'
                ? $repo->getAvailableTests($userId)
                : Inertia::lazy(fn() => $repo->getAvailableTests($userId)),

            'completed_tests' => $activeTab === 'completed'
                ? $repo->getCompletedTests($userId)
                : Inertia::lazy(fn() => $repo->getCompletedTests($userId)),

            'my_tests' => $activeTab === 'my'
                ? $repo->getMyTests($userId)
                : Inertia::lazy(fn() => $repo->getMyTests($userId)),

            'current_user_id' => $userId,
        ]);
    }

    public function store(TestStoreRequest $r, TestService $testService)
    {
        $test = $testService->getData($r->validated());

        Test::create($test);

        return redirect()->route('tests.index', ['tab' => 'my'])->with('success', "Тест '{$test['title']}' успешно создан!");
    }

    public function destroy(int $id)
    {
        $test = Test::find($id);
        $name = $test['title'];

        if ($test->user_id !== Auth::id()) {
            abort(403, 'You are not authorized to delete this test.');
        }

        Test::destroy($id);
        return back()->with('success', "Тест '$name' успешно удалён!");
    }

    public function create()
    {
        return Inertia::render('Test/Create');
    }

    public function take(int $testId, TestAttemptRepository $repo, TestService $testService)
    {
        $userId = Auth::id();

        if ($testService->maxAttemptsReached($testId, $userId)) {
            return;
        }

        return Inertia::render('Test/Take', ['test' => $repo->getAvailableTest($testId, $userId)]);
    }

    public function results(int $id, TestAttemptRepository $repo)
    {
        $userId = Auth::id();

        $completed = $repo->getCompletedTest($id, $userId);
        return Inertia::render('Test/Result', ['testAttempt' => $completed]);
    }

    public function edit(int $id)
    {
        $test = Test::findOrFail($id);

        $content = is_string($test->content) ? json_decode($test->content, true) : $test->content;
        // dd($content);

        $testData = [
            'id' => $test->id,
            'title' => $test->title,
            'description' => $test->description,
            'questions' => $content,
        ];

        return Inertia::render('Test/Edit', [
            'test' => $testData
        ]);
    }

    //TestUpdateRequest
    public function update(TestUpdateRequest $r)
    {
        $data = $r->validated();
        $test = Test::find($r->id);
        $test_name = $test['title'];

        // Prepare the data for update
        $updateData = [
            'title' => $data['title'],
            'description' => $data['description'],
            'content' => $data['questions'], // Laravel will automatically cast to JSON
            'is_published' => $data['is_published'] ?? $test->is_published,
        ];

        $test->update($updateData);

        return redirect()->route('tests.index', ['tab' => 'my'])->with('success', "Тест '{$data['title']}' успешно обновлён!");
    }
}
