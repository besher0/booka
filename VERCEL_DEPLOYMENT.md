# Booka Backend - Vercel Deployment Guide

## Prerequisites
1. Vercel account
2. PostgreSQL database (you can use services like Neon, Supabase, or Railway)
3. Cloudinary account for image uploads
4. Firebase project for notifications

## Deployment Steps

### 1. Prepare Your Database
- Create a PostgreSQL database on a cloud service (Neon, Supabase, Railway, etc.)
- Note down the connection details (host, username, password, database name, port)

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will automatically detect it as a Node.js project

### 3. Configure Environment Variables in Vercel
Go to your project settings in Vercel and add these environment variables:

#### Database Configuration
- `DB_HOST`: Your PostgreSQL host
- `DB_USERNAME`: Your PostgreSQL username  
- `DB_PASSWORD`: Your PostgreSQL password
- `DB_DATABASE`: Your PostgreSQL database name
- `DB_PORT`: 5432 (default PostgreSQL port)

#### Application Configuration
- `NODE_ENV`: production
- `JWT_SECRET`: A secure random string for JWT tokens
- `JWT_EXPIRATION_TIME`: 1d

#### Firebase Configuration
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Your Firebase service account JSON (as a string)

#### Cloudinary Configuration
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

#### TextLocal Configuration (if using SMS)
- `TEXTLOCAL_API_KEY`: Your TextLocal API key
- `TEXTLOCAL_SENDER_NAME`: booka

### 4. Database Setup
After deployment, your database tables will be automatically created due to `synchronize: true` in development. For production, consider:
- Setting `synchronize: false` 
- Using TypeORM migrations for better control

### 5. Test Your Deployment
- Your API will be available at `https://your-project-name.vercel.app`
- Test the endpoints to ensure everything works correctly

## Important Notes

1. **Database Connection**: Make sure your PostgreSQL database allows connections from Vercel's IP ranges
2. **Environment Variables**: Never commit sensitive data to your repository
3. **CORS**: The application is configured to allow CORS for all origins in production
4. **File Uploads**: Images are handled by Cloudinary, so no local file storage issues
5. **Serverless Functions**: Each API call runs in a serverless function with a 30-second timeout

## Troubleshooting

### Common Issues:
1. **Database Connection Errors**: Check your database credentials and ensure the database accepts external connections
2. **Environment Variables**: Ensure all required environment variables are set in Vercel
3. **Build Errors**: Check the build logs in Vercel dashboard
4. **Timeout Issues**: Large operations might hit the 30-second serverless function limit

### Logs:
- Check Vercel function logs in the dashboard
- Use `console.log` for debugging (visible in Vercel logs)

## Performance Considerations
- Database connections are created per request (serverless nature)
- Consider connection pooling for high-traffic applications
- Monitor function execution time and memory usage

## Security Recommendations
1. Use strong JWT secrets
2. Implement rate limiting
3. Validate all inputs
4. Use HTTPS only (Vercel provides this automatically)
5. Regularly update dependencies