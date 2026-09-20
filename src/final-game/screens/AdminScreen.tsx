import AdminControl from '../components/AdminControl'

/** Thin wrapper for the operator entry point — kept separate from
 * AdminControl.tsx itself in case the admin view later needs auth gating
 * without touching the reusable AdminControl component. */
export default function AdminScreen() {
  return <AdminControl />
}
