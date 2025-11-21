/* eslint-disable no-console */
const { PrismaClient, CourseStatus, ResourceType, UserRole } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@educonexa.local" },
    update: {},
    create: {
      id: "seed-admin",
      name: "Administrador",
      email: "admin@educonexa.local",
      passwordHash,
      role: UserRole.ADMIN,
      profile: {
        create: {
          bio: "Conta administrativa para testes.",
          avatarUrl: null,
        },
      },
    },
  })

  const courseA = await prisma.course.upsert({
    where: { id: "seed-curso-1" },
    update: {},
    create: {
      id: "seed-curso-1",
      title: "Inclusão Educacional 101",
      description: "Fundamentos de inclusão educacional e práticas colaborativas.",
      status: CourseStatus.PUBLISHED,
      authorId: admin.id,
      lessons: {
        create: [
          {
            id: "seed-lesson-1",
            title: "Boas-vindas e objetivos",
            description: "Panorama do curso e metas de aprendizagem.",
            order: 1,
            content: "Nesta aula, você conhecerá os objetivos gerais do programa.",
          },
          {
            id: "seed-lesson-2",
            title: "Legislação e diretrizes",
            description: "Bases legais da inclusão educacional.",
            order: 2,
            content: "Revisão das principais leis e diretrizes nacionais.",
          },
        ],
      },
      resources: {
        create: [
          {
            id: "seed-resource-1",
            title: "Guia de Inclusão",
            url: "https://example.com/guia-inclusao.pdf",
            type: ResourceType.PDF,
          },
          {
            id: "seed-resource-2",
            title: "Toolkit de Acessibilidade",
            url: "https://example.com/toolkit",
            type: ResourceType.LINK,
          },
        ],
      },
    },
  })

  const courseB = await prisma.course.upsert({
    where: { id: "seed-curso-2" },
    update: {},
    create: {
      id: "seed-curso-2",
      title: "Tecnologias assistivas",
      description: "Ferramentas e abordagens práticas para acessibilidade.",
      status: CourseStatus.DRAFT,
      authorId: admin.id,
    },
  })

  await prisma.post.upsert({
    where: { id: "seed-post-1" },
    update: {},
    create: {
      id: "seed-post-1",
      title: "Bem-vindo à comunidade",
      content: "Apresente-se e compartilhe suas expectativas!",
      authorId: admin.id,
      courseId: courseA.id,
      comments: {
        create: [
          {
            id: "seed-comment-1",
            content: "Conte comigo para ajudar!",
            authorId: admin.id,
          },
        ],
      },
    },
  })

  await prisma.certification.upsert({
    where: { id: "seed-cert-1" },
    update: {},
    create: {
      id: "seed-cert-1",
      certificateCode: "CERT-0001",
      userId: admin.id,
      courseId: courseA.id,
      issuedAt: new Date(),
    },
  })

  console.log("Seed concluído com sucesso.")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
