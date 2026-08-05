import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    const { data: existingUser } = await this.supabase.getClient()
      .from('users')
      .select('id')
      .eq('email', dto.email)
      .maybeSingle();

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const passwordhash = await bcrypt.hash(dto.password, salt);

    const { data: user, error } = await this.supabase.getClient()
      .from('users')
      .insert({
        email: dto.email,
        passwordhash,
        name: dto.name,
      })
      .select('*')
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const { data: user } = await this.supabase.getClient()
      .from('users')
      .select('*')
      .eq('email', dto.email)
      .maybeSingle();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordhash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    };
  }
}
