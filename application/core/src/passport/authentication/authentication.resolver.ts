import {
  Field,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "@nestjs/graphql"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Column, Entity, PrimaryGeneratedColumn, Repository } from "typeorm"

@ObjectType()
class Registration {
  @Field() // @todo: fix
  token: string
}

@Entity()
@ObjectType()
export class User {
  @Column({ nullable: true, unique: true })
  @Field()
  email: string

  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number

  @Field()
  password: string
}

@Resolver()
export class AuthenticationResolver {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService
  ) {}
  @Mutation(() => Registration, { name: "registerTemporalUser" })
  async createTemporalUser(): Promise<Registration> {
    const user = await this.usersRepo.save(this.usersRepo.create())
    const token = await this.jwtService.signAsync(
      { email: user.email, sub: user.id },
      {
        secret: "secret",
      }
    )
    return { token: token }
  }

  @Query(() => String, { name: "test" })
  test() {
    return "test"
  }
}
