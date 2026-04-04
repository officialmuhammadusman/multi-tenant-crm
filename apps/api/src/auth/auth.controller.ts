// apps/api/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { LoginSchema, LoginDto } from '@crm/types';
import { Public } from '../common/decorators';
import { getRequestContext } from '../common/context/request-context';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  @SwaggerResponse({ status: 200, description: 'Login successful — returns access token' })
  @SwaggerResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const correlationId = getRequestContext()?.correlationId ?? '';
    const { response, refreshToken } = await this.authService.loginAndGetRefreshToken(dto, correlationId);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth',
    });

    return response;
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token using HTTP-only cookie' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const correlationId = getRequestContext()?.correlationId ?? '';
    const refreshToken = req.cookies?.['refresh_token'] as string | undefined;

    if (!refreshToken) {
      return { success: false, statusCode: 401, message: 'Refresh token missing', data: null, error: 'Refresh token missing', errors: null, meta: null };
    }

    const { response, newRefreshToken } = await this.authService.refresh(refreshToken, correlationId);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });

    return response;
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout — revokes refresh token and blocklists access token' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const correlationId = getRequestContext()?.correlationId ?? '';
    const refreshToken = req.cookies?.['refresh_token'] as string | undefined;
    const accessToken = (req.headers.authorization ?? '').replace('Bearer ', '');

    const result = await this.authService.logout(refreshToken ?? '', accessToken, correlationId);

    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    return result;
  }
}
