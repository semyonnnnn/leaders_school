<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request; ////////////////////////////
use App\Http\Requests\Test\TestAttemptRequest;
use App\Services\TestEvaluationService;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Repositories\TestAttemptRepository;

class TestAttemptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        TestAttemptRequest $r,
        TestEvaluationService $evaluator,
        TestAttemptRepository $repo
    ) {
        $test = Test::findOrFail($r->input('id'));

        $data = $evaluator->evaluate($r, $test);

        $repo->store($data);

        return redirect()->route('tests.index', ['tab' => 'completed'])->with('message', 'Horray~');
    }

    /**
     * Display the specified resource.
     */
    public function show(TestAttempt $testAttempt)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TestAttempt $testAttempt)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TestAttempt $testAttempt)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TestAttempt $testAttempt)
    {
        //
    }
}
