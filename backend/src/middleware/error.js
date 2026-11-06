import { ZodError } from 'zod'
export function notFound(req, res) { res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` }) }
export function errorHandler(err, req, res, next) {
  console.error(err)
  if (err instanceof ZodError) return res.status(422).json({ success: false, message: 'Please correct the highlighted fields.', errors: err.flatten() })
  if (err?.code === 11000) return res.status(409).json({ success: false, message: 'A record with this value already exists.' })
  res.status(err.status || 500).json({ success: false, message: err.message || 'Something went wrong.' })
}
