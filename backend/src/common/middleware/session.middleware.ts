/**
 * Session Middleware
 * 
 * Manages session IDs for anonymous users via cookies.
 * Generates new session ID if not present.
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Check for existing session ID in cookies
        let sessionId = req.cookies?.session_id;

        if (!sessionId) {
            // Generate new session ID
            sessionId = randomUUID();

            // Set cookie with 30-day expiry
            res.cookie('session_id', sessionId, {
                httpOnly: true, // Prevent JavaScript access
                secure: process.env.NODE_ENV === 'production', // HTTPS only in production
                sameSite: 'lax', // Allow navigation
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
            });
        }

        // Attach session ID to request object
        req['sessionId'] = sessionId;

        next();
    }
}
