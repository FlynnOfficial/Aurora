export interface Grade {
  subject: string;
  grades: {
    period: string;
    grade: number;
    weight: number;
  }[];
  average: number;
  status: 'approved' | 'failed' | 'recovering';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password: string;
  class: string;
  enrollment: string;
  grades: Grade[];
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  password: string;
  subject: string;
  classes: string[];
}

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria.silva@escola.com',
    password: 'aluno123',
    class: '9º Ano A',
    enrollment: '2024001',
    grades: [
      {
        subject: 'Matemática',
        grades: [
          { period: '1º Bimestre', grade: 8.5, weight: 1 },
          { period: '2º Bimestre', grade: 7.0, weight: 1 },
          { period: '3º Bimestre', grade: 9.0, weight: 1 },
          { period: '4º Bimestre', grade: 8.0, weight: 1 },
        ],
        average: 8.1,
        status: 'approved',
      },
      {
        subject: 'Português',
        grades: [
          { period: '1º Bimestre', grade: 9.0, weight: 1 },
          { period: '2º Bimestre', grade: 8.5, weight: 1 },
          { period: '3º Bimestre', grade: 9.5, weight: 1 },
          { period: '4º Bimestre', grade: 9.0, weight: 1 },
        ],
        average: 9.0,
        status: 'approved',
      },
      {
        subject: 'História',
        grades: [
          { period: '1º Bimestre', grade: 7.5, weight: 1 },
          { period: '2º Bimestre', grade: 8.0, weight: 1 },
          { period: '3º Bimestre', grade: 7.0, weight: 1 },
          { period: '4º Bimestre', grade: 8.5, weight: 1 },
        ],
        average: 7.8,
        status: 'approved',
      },
      {
        subject: 'Ciências',
        grades: [
          { period: '1º Bimestre', grade: 6.0, weight: 1 },
          { period: '2º Bimestre', grade: 5.5, weight: 1 },
          { period: '3º Bimestre', grade: 6.5, weight: 1 },
          { period: '4º Bimestre', grade: 7.0, weight: 1 },
        ],
        average: 6.3,
        status: 'recovering',
      },
      {
        subject: 'Educação Física',
        grades: [
          { period: '1º Bimestre', grade: 10.0, weight: 1 },
          { period: '2º Bimestre', grade: 9.5, weight: 1 },
          { period: '3º Bimestre', grade: 10.0, weight: 1 },
          { period: '4º Bimestre', grade: 9.5, weight: 1 },
        ],
        average: 9.8,
        status: 'approved',
      },
    ],
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao.santos@escola.com',
    password: 'aluno123',
    class: '9º Ano A',
    enrollment: '2024002',
    grades: [
      {
        subject: 'Matemática',
        grades: [
          { period: '1º Bimestre', grade: 7.0, weight: 1 },
          { period: '2º Bimestre', grade: 6.5, weight: 1 },
          { period: '3º Bimestre', grade: 7.5, weight: 1 },
          { period: '4º Bimestre', grade: 8.0, weight: 1 },
        ],
        average: 7.3,
        status: 'approved',
      },
      {
        subject: 'Português',
        grades: [
          { period: '1º Bimestre', grade: 8.0, weight: 1 },
          { period: '2º Bimestre', grade: 7.5, weight: 1 },
          { period: '3º Bimestre', grade: 8.5, weight: 1 },
          { period: '4º Bimestre', grade: 8.0, weight: 1 },
        ],
        average: 8.0,
        status: 'approved',
      },
    ],
  },
];

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export const mockAdmins: Admin[] = [
  {
    id: '1',
    name: 'Diretora Helena Costa',
    email: 'helena.costa@escola.com',
    password: 'admin123',
    role: 'Diretora',
  },
];

export interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'super_admin';
}

export const mockSuperAdmins: SuperAdmin[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@escola.com',
    password: 'Super@Admin1',
    role: 'super_admin',
  },
];

export type RegistrationType = 'fisica' | 'juridica';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface PendingRegistrationFisica {
  type: 'fisica';
  cpf: string;
  nome: string;
  sobrenome: string;
  dataNascimento: string;
  email: string;
  telefone: string;
}

export interface PendingRegistrationJuridica {
  type: 'juridica';
  cnpj: string;
  nomeRepresentante: string;
  sobrenomeRepresentante: string;
  nomeEmpresa: string;
  razaoSocial: string;
  endereco: string;
  telefoneComercial: string;
  emailInstitucional: string;
  cpfRepresentante: string;
  cargoRepresentante: string;
  telefoneRepresentante: string;
}

export type PendingRegistrationData = PendingRegistrationFisica | PendingRegistrationJuridica;

export interface PendingRegistration {
  id: string;
  data: PendingRegistrationData;
  status: RegistrationStatus;
  submittedAt: string;
}

export const mockPendingRegistrations: PendingRegistration[] = [
  {
    id: '1',
    data: {
      type: 'fisica',
      cpf: '123.456.789-00',
      nome: 'Roberto',
      sobrenome: 'Almeida',
      dataNascimento: '1985-04-12',
      email: 'roberto.almeida@email.com',
      telefone: '(11) 98765-4321',
    },
    status: 'pending',
    submittedAt: '2025-02-01T10:30:00Z',
  },
  {
    id: '2',
    data: {
      type: 'juridica',
      cnpj: '12.345.678/0001-99',
      nomeRepresentante: 'Fernanda',
      sobrenomeRepresentante: 'Gomes',
      nomeEmpresa: 'Escola Futuro Brilhante',
      razaoSocial: 'Futuro Brilhante Educação LTDA',
      endereco: 'Av. Paulista, 1000, 01311-000, SP',
      telefoneComercial: '(11) 3456-7890',
      emailInstitucional: 'contato@futurobrilhante.com.br',
      cpfRepresentante: '987.654.321-00',
      cargoRepresentante: 'Diretora Executiva',
      telefoneRepresentante: '(11) 99999-8888',
    },
    status: 'pending',
    submittedAt: '2025-02-03T14:00:00Z',
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Prof. Carlos Oliveira',
    email: 'carlos.oliveira@escola.com',
    password: 'prof123',
    subject: 'Matemática',
    classes: ['9º Ano A', '9º Ano B', '8º Ano A'],
  },
  {
    id: '2',
    name: 'Profa. Ana Paula',
    email: 'ana.paula@escola.com',
    password: 'prof123',
    subject: 'Português',
    classes: ['9º Ano A', '9º Ano B'],
  },
];

export interface MultipleChoiceQuestion {
  type: 'multiple_choice';
  id: string;
  statement: string;
  options: { id: string; text: string }[];
}

export interface EssayQuestion {
  type: 'essay';
  id: string;
  statement: string;
  placeholder?: string;
}

export type Question = MultipleChoiceQuestion | EssayQuestion;

export interface Activity {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  questions: Question[];
}

export const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Lista de Exercícios — Equações do 2º Grau',
    subject: 'Matemática',
    teacher: 'Prof. Carlos Oliveira',
    description: 'Resolva as questões abaixo sobre equações do 2º grau. Leia cada enunciado com atenção.',
    dueDate: '2025-02-15',
    status: 'pending',
    questions: [
      {
        type: 'multiple_choice',
        id: 'q1',
        statement: 'Qual é a fórmula de Bhaskara para calcular as raízes de uma equação do 2º grau ax² + bx + c = 0?',
        options: [
          { id: 'a', text: 'x = (−b ± √Δ) / 2a, onde Δ = b² − 4ac' },
          { id: 'b', text: 'x = (b ± √Δ) / 2a, onde Δ = b² + 4ac' },
          { id: 'c', text: 'x = (−b ± √Δ) / a, onde Δ = b² − 4ac' },
          { id: 'd', text: 'x = (−b ± Δ) / 2a, onde Δ = b² − 4ac' },
        ],
      },
      {
        type: 'multiple_choice',
        id: 'q2',
        statement: 'Quais são as raízes da equação x² − 5x + 6 = 0?',
        options: [
          { id: 'a', text: 'x = 1 e x = 6' },
          { id: 'b', text: 'x = 2 e x = 3' },
          { id: 'c', text: 'x = −2 e x = −3' },
          { id: 'd', text: 'x = 2 e x = −3' },
        ],
      },
      {
        type: 'essay',
        id: 'q3',
        statement: 'Explique com suas próprias palavras o que significa o discriminante (Δ) de uma equação do 2º grau e o que cada resultado indica (Δ > 0, Δ = 0, Δ < 0).',
        placeholder: 'Escreva sua resposta aqui...',
      },
      {
        type: 'multiple_choice',
        id: 'q4',
        statement: 'Uma equação do 2º grau possui Δ = −9. Isso significa que ela tem:',
        options: [
          { id: 'a', text: 'Duas raízes reais distintas' },
          { id: 'b', text: 'Uma raiz real dupla' },
          { id: 'c', text: 'Nenhuma raiz real' },
          { id: 'd', text: 'Três raízes reais' },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Redação — Meio Ambiente',
    subject: 'Português',
    teacher: 'Profa. Ana Paula',
    description: 'Produza um texto dissertativo-argumentativo sobre o tema proposto. Atenção à coesão, coerência e argumentação.',
    dueDate: '2025-02-12',
    status: 'submitted',
    questions: [
      {
        type: 'essay',
        id: 'q1',
        statement: 'Leia a coletânea de textos motivadores e escreva uma redação dissertativa-argumentativa sobre o tema: "Os desafios da preservação ambiental no século XXI". Apresente uma proposta de intervenção detalhada, respeitando os direitos humanos. Mínimo de 25 linhas.',
        placeholder: 'Escreva sua redação aqui...',
      },
    ],
  },
  {
    id: '3',
    title: 'Questões — Segunda Guerra Mundial',
    subject: 'História',
    teacher: 'Prof. Roberto Lima',
    description: 'Avaliação sobre as causas, desenvolvimento e consequências da Segunda Guerra Mundial.',
    dueDate: '2025-02-20',
    status: 'graded',
    grade: 9.0,
    questions: [
      {
        type: 'multiple_choice',
        id: 'q1',
        statement: 'Qual evento é considerado o estopim imediato da Segunda Guerra Mundial?',
        options: [
          { id: 'a', text: 'A crise econômica de 1929' },
          { id: 'b', text: 'A invasão da Polônia pela Alemanha em setembro de 1939' },
          { id: 'c', text: 'O ataque japonês a Pearl Harbor' },
          { id: 'd', text: 'A ascensão de Hitler ao poder em 1933' },
        ],
      },
      {
        type: 'multiple_choice',
        id: 'q2',
        statement: 'Quais países formavam as principais potências do Eixo durante a Segunda Guerra Mundial?',
        options: [
          { id: 'a', text: 'Alemanha, Japão e Itália' },
          { id: 'b', text: 'Alemanha, URSS e Japão' },
          { id: 'c', text: 'EUA, Reino Unido e França' },
          { id: 'd', text: 'Alemanha, Itália e França' },
        ],
      },
      {
        type: 'essay',
        id: 'q3',
        statement: 'Descreva duas consequências geopolíticas da Segunda Guerra Mundial e explique como elas moldaram o mundo do século XX.',
        placeholder: 'Escreva sua resposta aqui...',
      },
    ],
  },
  {
    id: '4',
    title: 'Relatório — Fotossíntese',
    subject: 'Ciências',
    teacher: 'Profa. Mariana Souza',
    description: 'Responda às questões sobre o processo de fotossíntese com base no experimento realizado em sala.',
    dueDate: '2025-02-18',
    status: 'pending',
    questions: [
      {
        type: 'multiple_choice',
        id: 'q1',
        statement: 'Qual é a equação química geral que representa a fotossíntese?',
        options: [
          { id: 'a', text: '6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂' },
          { id: 'b', text: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energia' },
          { id: 'c', text: '6O₂ + 6H₂O + luz → C₆H₁₂O₆ + 6CO₂' },
          { id: 'd', text: '6CO₂ + 6O₂ + luz → C₆H₁₂O₆ + 6H₂O' },
        ],
      },
      {
        type: 'essay',
        id: 'q2',
        statement: 'Com base no experimento da elódea realizado em sala, descreva o que foi observado e explique por que a intensidade luminosa influencia na taxa fotossintética.',
        placeholder: 'Descreva suas observações e conclusões...',
      },
      {
        type: 'multiple_choice',
        id: 'q3',
        statement: 'Em qual organela celular ocorre a fotossíntese nas plantas?',
        options: [
          { id: 'a', text: 'Mitocôndria' },
          { id: 'b', text: 'Núcleo' },
          { id: 'c', text: 'Cloroplasto' },
          { id: 'd', text: 'Retículo endoplasmático' },
        ],
      },
    ],
  },
  {
    id: '5',
    title: 'Prova Bimestral — 3º Bimestre',
    subject: 'Matemática',
    teacher: 'Prof. Carlos Oliveira',
    description: 'Prova abrangendo funções, equações e geometria plana. Boa sorte!',
    dueDate: '2025-02-28',
    status: 'pending',
    questions: [
      {
        type: 'multiple_choice',
        id: 'q1',
        statement: 'Uma função f(x) = 2x + 3 é classificada como:',
        options: [
          { id: 'a', text: 'Função quadrática' },
          { id: 'b', text: 'Função afim (1º grau)' },
          { id: 'c', text: 'Função constante' },
          { id: 'd', text: 'Função exponencial' },
        ],
      },
      {
        type: 'multiple_choice',
        id: 'q2',
        statement: 'Qual é a área de um triângulo com base 8 cm e altura 5 cm?',
        options: [
          { id: 'a', text: '40 cm²' },
          { id: 'b', text: '20 cm²' },
          { id: 'c', text: '13 cm²' },
          { id: 'd', text: '80 cm²' },
        ],
      },
      {
        type: 'essay',
        id: 'q3',
        statement: 'Um retângulo tem perímetro de 36 cm e largura de 7 cm. Calcule o comprimento e a área do retângulo, apresentando todos os cálculos.',
        placeholder: 'Apresente seu desenvolvimento aqui...',
      },
      {
        type: 'multiple_choice',
        id: 'q4',
        statement: 'O coeficiente angular de uma reta que passa pelos pontos A(1, 2) e B(3, 8) é:',
        options: [
          { id: 'a', text: '2' },
          { id: 'b', text: '3' },
          { id: 'c', text: '4' },
          { id: 'd', text: '6' },
        ],
      },
      {
        type: 'essay',
        id: 'q5',
        statement: 'Explique a diferença entre função crescente e função decrescente, dando um exemplo de cada uma com suas respectivas representações gráficas descritas por escrito.',
        placeholder: 'Escreva sua resposta aqui...',
      },
    ],
  },
  {
    id: '6',
    title: 'Interpretação de Texto — Machado de Assis',
    subject: 'Português',
    teacher: 'Profa. Ana Paula',
    description: 'Questões de interpretação sobre o conto "O Alienista" de Machado de Assis.',
    dueDate: '2025-03-05',
    status: 'pending',
    questions: [
      {
        type: 'multiple_choice',
        id: 'q1',
        statement: 'No conto "O Alienista", qual é a principal crítica social que Machado de Assis faz através do personagem Simão Bacamarte?',
        options: [
          { id: 'a', text: 'A corrupção política no Brasil imperial' },
          { id: 'b', text: 'O abuso de poder e os limites arbitrários entre razão e loucura' },
          { id: 'c', text: 'A pobreza e a desigualdade social' },
          { id: 'd', text: 'A influência da Igreja Católica na sociedade' },
        ],
      },
      {
        type: 'essay',
        id: 'q2',
        statement: 'Simão Bacamarte interna a si mesmo ao final do conto. O que esse desfecho representa simbolicamente? Desenvolva sua interpretação em pelo menos um parágrafo.',
        placeholder: 'Escreva sua interpretação aqui...',
      },
    ],
  },
];

export const chatbotResponses: Record<string, string> = {
  notas: 'Você pode visualizar suas notas na aba "Minhas Notas" do painel. Lá você encontra todas as suas notas organizadas por disciplina e bimestre.',
  horario: 'O horário das aulas está disponível no sistema. Entre em contato com a secretaria para mais informações sobre mudanças de horário.',
  prova: 'As datas das provas são publicadas no calendário escolar. Fique atento aos comunicados dos professores!',
  recuperacao: 'Para disciplinas com média abaixo de 7.0, você terá direito à recuperação ao final do ano letivo.',
  media: 'A média mínima para aprovação é 7.0. A média final é calculada pela soma das notas dos 4 bimestres dividida por 4.',
  ajuda: 'Estou aqui para ajudar! Posso responder sobre: notas, horários, provas, recuperação e média de aprovação.',
  default: 'Desculpe, não entendi sua pergunta. Tente perguntar sobre: notas, horários, provas, recuperação ou média.',
};
