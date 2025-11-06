# Resume Upload Endpoint Documentation

## Endpoint: `POST /api/v1/resumes/upload`

### Description
Uploads a PDF resume, extracts text using PyMuPDF, stores the file in S3/MinIO, and saves a record in the database.

### Authentication
Requires JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

### Request

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required): PDF file to upload
  - Max size: 5MB
  - MIME type: `application/pdf`
  - Extension: `.pdf`

### Response

**Success (200 OK):**
```json
{
  "upload_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_key": "resumes/123/550e8400-e29b-41d4-a716-446655440000.pdf",
  "chars": 1245,
  "pages": 2
}
```

**Error Responses:**

- `400 Bad Request`: Invalid file type, size, or format
- `403 Forbidden`: Missing or invalid authentication
- `500 Internal Server Error`: Storage or database error

### Features

1. **File Validation**
   - Validates file extension (must be `.pdf`)
   - Validates MIME type (must be `application/pdf`)
   - Validates file size (max 5MB)
   - Validates PDF format

2. **Text Extraction**
   - Uses PyMuPDF to extract text from PDF
   - Returns character count and page count
   - Handles scanned PDFs gracefully (returns empty text, doesn't fail)

3. **Storage**
   - Stores file in S3/MinIO bucket under `resumes/{user_id}/{upload_id}.pdf`
   - Supports both AWS S3 and MinIO for local development

4. **Database**
   - Creates record in `resume_uploads` table with:
     - `id`: UUID string
     - `user_id`: User who uploaded
     - `file_key`: S3 object key
     - `parsed_text`: Extracted text (empty string if scanned PDF)
     - `uploaded_at`: UTC timestamp

### Environment Variables

Required for S3/MinIO:
```env
# For AWS S3
USE_MINIO=false
AWS_REGION=us-east-1
S3_BUCKET_NAME=placement-navigator

# For MinIO (local)
USE_MINIO=true
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### Example Usage

```bash
curl -X POST "http://localhost:8000/api/v1/resumes/upload" \
  -H "Authorization: Bearer <token>" \
  -F "file=@resume.pdf"
```

### Testing

Run unit tests:
```bash
cd backend
pytest ../tests/test_resume_upload.py -v
```

### Notes

- Empty text extraction (scanned PDFs) is handled gracefully - upload succeeds but `parsed_text` is empty
- Extraction time is logged for monitoring
- File is stored with UUID to prevent collisions
- Supports both S3 and MinIO for flexibility in development/production


