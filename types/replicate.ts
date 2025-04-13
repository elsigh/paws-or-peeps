export interface Prediction {
  id: string
  version: string
  urls: {
    get: string
    cancel: string
  }
  created_at: string
  started_at: string | null
  completed_at: string | null
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled"
  input: Record<string, any>
  output: string[] | null
  error: string | null
  logs: string | null
  metrics: {
    predict_time: number
  }
}
