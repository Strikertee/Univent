<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Usage: ->middleware('role:super_admin,division_admin')
 * Division admins are further scoped inside controllers via managesDivision().
 */
class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, $roles, true)) {
            return response()->json(['success' => false, 'message' => 'Forbidden: insufficient role'], 403);
        }
        return $next($request);
    }
}
