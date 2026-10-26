// Keep the runtime entry point free of exported test helpers/constants.
// workerd interprets named exports as additional Worker entry points.
import handler from './model.ts'

export default handler
