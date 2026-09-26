/** A file in a FileUpload's list, as it goes up. */
export interface UploadFile {
  id: string
  name: string
  /** In bytes. */
  size: number
  /** The file itself, for one just added. */
  file?: File
  status: 'uploading' | 'done' | 'error'
  /** From 0 to 1, while uploading. */
  progress?: number
  /** What went wrong. */
  error?: string
}

/** Sends a file, telling how far it has got (0 to 1); throws, with a message, if it fails. */
export type Uploader = (file: File, progress: (fraction: number) => void) => Promise<void>
