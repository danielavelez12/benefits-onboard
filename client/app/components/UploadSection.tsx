interface UploadSectionProps {
  autoClassify: boolean;
  file: File | null;
  uploading: boolean;
  onAutoClassifyChange: (checked: boolean) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

export function UploadSection({
  autoClassify,
  file,
  uploading,
  onAutoClassifyChange,
  onFileChange,
  onUpload,
}: UploadSectionProps) {
  return (
    <div className="mb-8 p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
      <div className="mb-4">
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={autoClassify}
            onChange={(e) => onAutoClassifyChange(e.target.checked)}
            className="mr-2 w-4 h-4 text-zinc-900 bg-zinc-100 border-zinc-300 rounded focus:ring-zinc-500 dark:bg-zinc-700 dark:border-zinc-600"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Auto-classify transactions
          </span>
        </label>
      </div>

      {!autoClassify && (
        <div className="mb-4">
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Select Bank Statement (PDF or Image)
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={onFileChange}
            className="block w-full text-sm text-zinc-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-zinc-100 file:text-zinc-700
              hover:file:bg-zinc-200
              dark:file:bg-zinc-800 dark:file:text-zinc-300"
          />
        </div>
      )}

      {file && !autoClassify && (
        <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Selected: {file.name}
        </div>
      )}

      <button
        onClick={onUpload}
        disabled={(!file && !autoClassify) || uploading}
        className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {uploading
          ? "Processing..."
          : autoClassify
            ? "Classify Transactions"
            : "Upload & Process"}
      </button>
    </div>
  );
}
