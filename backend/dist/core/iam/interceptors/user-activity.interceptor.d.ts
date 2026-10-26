import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class UserActivityInterceptor implements NestInterceptor {
    private userRepository;
    constructor(userRepository: Repository<User>);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
