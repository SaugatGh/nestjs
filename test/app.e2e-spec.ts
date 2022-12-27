import { EditBookmarkDto } from './../src/bookmark/dto/edit-bookmark.dto';
import { CreateBookmarkDto } from './../src/bookmark/dto/create-bookmark.dto';
import { EditUserDto } from './../src/user/dto/edit-user.dto';
import { AuthDto } from './../src/auth/dto/auth.dto';
import { PrismaService } from './../src/prisma/prisma.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(5432);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:5432');
  });
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'vlad@gmail.com',
      password: '1234',
    };
    //**** */
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if no details/body provided ', () => {
        return pactum
          .spec()
          .post('/auth/signup')

          .expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .inspect();
      });
    });

    //****** */
    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if no details/body provided ', () => {
        return pactum
          .spec()
          .post('/auth/signin')

          .expectStatus(400);
      });
      it('you should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .inspect();
      });
    });
    describe('Edit user', () => {
      it('should edit  user', () => {
        const dto: EditUserDto = {
          firstName: 'vladmir',
          email: 'vlad@gmail.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
        // .inspect();
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmkark', () => {
      it('should get bookmkars', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(201)
          .inspect()
          .expectBody([]);
      });
    });

    describe('Create bookmkark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmarnk',
        link: 'http://localhost:3000',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmkark', () => {
      it('should get bookmkars', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(201)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmkark by id', () => {
      it('should get bookmkars by id ', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkI}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(201)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmkark by id', () => {
      it('should edit bookmkars by id ', () => {
        const dto: EditBookmarkDto = {
          title: 'hello',
          description: 'updated',
        };
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkI}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmkark by id', () => {
      it('should delete bookmkars  ', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkI}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')

          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(201)
          .expectJsonLength(0);
      });
    });
  });
});
