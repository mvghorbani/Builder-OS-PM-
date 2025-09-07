# Builder OS PM - Document Management System

## Replit Setup Instructions

1. **Fork this repository to Replit**
   - Go to [replit.com](https://replit.com)
   - Click "New Repl"
   - Choose "Import from GitHub"
   - Paste this repository URL

2. **Set up environment variables in Replit**
   - Click on "Tools" in the left sidebar
   - Click on "Secrets"
   - Add the following secrets:
     ```
     AWS_ACCESS_KEY_ID=your_aws_access_key
     AWS_SECRET_ACCESS_KEY=your_aws_secret_key
     JWT_SECRET=your_jwt_secret
     SESSION_SECRET=your_session_secret
     ```

3. **Set up AWS S3**
   - Go to AWS Console
   - Create a new S3 bucket named "builder-os-documents"
   - Set up CORS configuration for your bucket:
     ```json
     [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
         "AllowedOrigins": ["*"],
         "ExposeHeaders": []
       }
     ]
     ```
   - Create an IAM user with S3 access
   - Copy the access key and secret to Replit secrets

4. **Initialize the database**
   - The database will be automatically created in Replit
   - Run the following in the Replit shell to apply migrations:
     ```bash
     psql -U $REPL_OWNER -d $REPL_SLUG -f migrations/20250906_add_annotations.sql
     ```

5. **Start the application**
   - Click the "Run" button in Replit
   - The application will start in development mode
   - The URL will be: https://[repl-name].[username].repl.co

## Features

### Document Management
- View documents (PDF, images, etc.)
- Add annotations (text, highlights, comments)
- Add stamps and signatures
- Mobile signing via QR code

### Document Annotations
- Text annotations
- Highlights
- Comments
- Stamps (including signatures)
- Mobile signing

### Storage
- Documents and annotations stored in PostgreSQL
- Signatures and stamps stored in AWS S3
- Secure access control via JWT

## Troubleshooting

1. **Database Issues**
   - Check if the database is running: `ps aux | grep postgres`
   - Reset the database: Click "Tools" > "Database" > "Reset Database"

2. **S3 Issues**
   - Verify your AWS credentials in Replit secrets
   - Check S3 bucket permissions
   - Verify CORS configuration

3. **Application Issues**
   - Check the console for errors
   - Verify all environment variables are set
   - Try restarting the repl

## Support

For issues or questions:
1. Open an issue on GitHub
2. Check the Replit community forums
3. Contact the development team
