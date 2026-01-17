<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;

class TaskController extends Controller
{
    // GET /api/tasks
   public function index(Request $request)
{
    if (!$request->user()) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    $query = $request->user()->tasks();

    // filter status selesai / belum
    if ($request->has('is_done')) {
        $query->where('is_done', $request->is_done);
    }

    // sorting dinamis
    $query->orderBy(
        $request->get('sort', 'created_at'),
        $request->get('direction', 'desc')
    );

    // pagination
    return response()->json([
        'tasks' => $query->paginate(10)
    ]);
}



    // POST /api/tasks
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'priority' => 'in:low,medium,high',
            'due_date' => 'nullable|date',
        ]);

        $task = $request->user()->tasks()->create([
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority ?? 'medium',
            'due_date' => $request->due_date,
        ]);

        return response()->json([
            'message' => 'Task berhasil dibuat',
            'task' => $task
        ], 201);
    }

    // PUT /api/tasks/{id}
    public function update(Request $request, $id)
    {
        $task = $request->user()->tasks()->findOrFail($id);

        $task->update($request->only([
            'title',
            'description',
            'priority',
            'due_date',
            'is_done'
        ]));

        return response()->json([
            'message' => 'Task berhasil diupdate',
            'task' => $task
        ]);
    }

    // DELETE /api/tasks/{id}
    public function destroy(Request $request, $id)
    {
        $task = $request->user()->tasks()->findOrFail($id);
        $task->delete();

        return response()->json([
            'message' => 'Task berhasil dihapus'
        ]);
    }

    // PATCH /api/tasks/{id}/done
    public function toggleDone(Request $request, $id)
{
    if (!$request->user()) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    $task = $request->user()->tasks()->findOrFail($id);
    $task->is_done = !$task->is_done;
    $task->save();

    return response()->json([
        'message' => 'Status task diubah',
        'task' => $task
    ]);
}

}
