import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Role, RoleName } from '../database/entities/role.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['role', 'employee'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'employee'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role', 'employee'],
    });
  }

  async getRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async updateUserRole(userId: string, dto: UpdateUserRoleDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['role'] });
    if (!user) throw new NotFoundException('User not found');

    let role: Role | null = null;
    if (dto.roleId) {
      role = await this.roleRepository.findOne({ where: { id: dto.roleId } });
    } else if (dto.roleName) {
      role = await this.roleRepository.findOne({ where: { name: dto.roleName } });
    }

    if (!role) throw new BadRequestException('Invalid role');

    user.role = role;
    user.roleId = role.id;
    await this.userRepository.save(user);
    return this.findOne(user.id);
  }
}
