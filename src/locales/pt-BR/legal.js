export default {
  updated: 'Última atualização: {date}',
  contact: 'Dúvidas ou pedidos sobre seus dados:',
  privacy: {
    title: 'Política de privacidade',
    intro: 'O eHub é operado pela JohnJohn 3D (CNPJ 27.140.814/0001-88), controladora dos dados. Aqui explicamos, em linguagem simples, quais dados o eHub usa, para quê, com quem compartilha e como você exerce seus direitos pela Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018). Contato: {contact}.',
    sections: [
      {
        title: 'Quais dados coletamos',
        items: [
          'Conta: nome, sobrenome, e-mail, nome de usuário, senha (guardada só de forma criptografada) e, se você quiser, telefone e foto.',
          'Perfil (opcional): bio, cidade, data de nascimento, redes sociais, cor do perfil e preferências de notificação.',
          'Inscrições: os eventos em que você se inscreve, as respostas às perguntas que o organizador fez no formulário, a situação do pagamento e seus resultados.',
          'Equipes e organizações: das quais você participa, segue ou pediu para entrar.',
          'Uso técnico: endereço IP e dados de acesso registrados pelo servidor para segurança e para cumprir o Marco Civil da Internet.',
          'Não coletamos dados de cartão: o pagamento é feito direto no Stripe ou no Mercado Pago.',
        ],
      },
      {
        title: 'Para que usamos',
        items: [
          'Criar e manter sua conta, fazer login e recuperar a senha (execução do contrato).',
          'Fazer sua inscrição em eventos, processar o pagamento e mostrar classificações e resultados (execução do contrato).',
          'Enviar avisos sobre suas inscrições, equipes e organizações (execução do contrato; você escolhe os avisos no seu perfil).',
          'Prevenir fraude e abuso, como limitar tentativas de login (legítimo interesse).',
          'Cumprir obrigações legais e fiscais, como notas fiscais emitidas para organizações.',
          'Não vendemos seus dados e não usamos ferramentas de anúncio ou rastreamento.',
        ],
      },
      {
        title: 'O que fica público e o que o organizador vê',
        items: [
          'Seu perfil é público por padrão. Você pode mudar para "Seguidores" ou "Privado" em Perfil > Privacidade. Perfis de pessoas não aparecem no Google.',
          'Nos eventos, outras pessoas veem seu nome, nome de usuário e resultados na lista de participantes e na classificação.',
          'O organizador do evento vê sua inscrição, as respostas ao formulário dele e a situação do pagamento. Ele não vê seu e-mail, telefone nem senha.',
          'Páginas de eventos, organizações, equipes e notícias são públicas e podem aparecer em buscadores.',
        ],
      },
      {
        title: 'Com quem compartilhamos',
        items: [
          'Stripe e Mercado Pago: para processar pagamentos e reembolsos das inscrições.',
          'Google: somente se você escolher entrar com sua conta Google (recebemos nome, e-mail e foto).',
          'Mailtrap: serviço que entrega os e-mails do eHub (códigos, avisos e convites).',
          'Umbler: hospedagem dos servidores e do banco de dados, no Brasil.',
          'Bling: emissão de nota fiscal das assinaturas de organizações (dados fiscais da organização).',
          'Alguns desses serviços podem processar dados fora do Brasil; nesses casos usamos fornecedores que oferecem garantias de proteção compatíveis com a LGPD.',
        ],
      },
      {
        title: 'Cookies e armazenamento no navegador',
        items: [
          'Usamos apenas cookies necessários: sessão de login, proteção contra falsificação de pedidos (CSRF) e "lembrar de mim".',
          'Guardamos no seu navegador o idioma, o tema claro/escuro e rascunhos de formulários, para sua conveniência.',
          'Fontes e bibliotecas são carregadas de serviços públicos (Google Fonts, jsDelivr e jQuery CDN), que recebem o endereço IP do seu navegador.',
        ],
      },
      {
        title: 'Por quanto tempo guardamos',
        items: [
          'Dados da conta: enquanto ela existir. Ao excluir a conta, apagamos seu perfil, fotos, inscrições, resultados, notificações e equipes em que você estava sozinho.',
          'Registros de pagamento e de cobrança das organizações: pelo prazo exigido pela legislação fiscal.',
          'Registros de acesso: 6 meses, como exige o Marco Civil da Internet.',
          'Códigos enviados por e-mail: de 10 a 15 minutos.',
        ],
      },
      {
        title: 'Seus direitos e como exercer',
        items: [
          'Ver e baixar seus dados: Perfil > Privacidade > "Baixar meus dados".',
          'Corrigir dados: edite seu perfil a qualquer momento.',
          'Excluir a conta: Perfil > Conta > "Excluir conta". Se você for o único dono de uma organização ou o único responsável por uma equipe com outros membros, transfira antes.',
          'Revogar escolhas: altere visibilidade do perfil e notificações quando quiser.',
          'Para os demais direitos (informação sobre compartilhamento, oposição, revisão), escreva para {contact}. Você também pode reclamar à ANPD.',
        ],
      },
      {
        title: 'Segurança',
        items: [
          'Conexão sempre criptografada (HTTPS), senhas com hash forte, limite de tentativas de login e controle de acesso por papel nas organizações.',
          'Se acontecer um incidente que possa trazer risco a você, avisaremos você e a ANPD.',
        ],
      },
      {
        title: 'Menores de idade',
        items: [
          'Menores de 18 anos devem usar o eHub com autorização e acompanhamento do responsável legal. Menores de 12 anos só podem ter conta criada e gerida pelo responsável.',
        ],
      },
    ],
  },
  terms: {
    title: 'Termos de uso',
    intro: 'Estas regras valem para todos que usam o eHub para organizar ou participar de campeonatos. Ao criar uma conta você concorda com elas. Contato: {contact}.',
    sections: [
      {
        title: 'O que é o eHub',
        items: [
          'Uma plataforma para organizações criarem eventos e campeonatos, receberem inscrições (gratuitas ou pagas) e publicarem resultados, e para participantes se inscreverem e acompanharem.',
          'O eHub fornece a ferramenta; cada evento é de responsabilidade da organização que o criou (regras, premiação, realização e atendimento).',
        ],
      },
      {
        title: 'Sua conta',
        items: [
          'Use dados verdadeiros e mantenha sua senha em segredo. Você responde pelo que for feito com a sua conta.',
          'Uma pessoa por conta. Menores de 18 anos precisam de autorização do responsável.',
          'Podemos suspender contas usadas para fraude, assédio, spam ou que violem a lei.',
        ],
      },
      {
        title: 'Inscrições e pagamentos',
        items: [
          'O valor, o prazo e as regras de cada inscrição são definidos pelo organizador e aparecem antes de você confirmar.',
          'Pagamentos são processados pelo Stripe ou pelo Mercado Pago, na conta do organizador.',
          'Cancelamento: se o organizador permitir, você pode cancelar até o início do evento e o valor volta para o mesmo meio de pagamento. Depois disso, vale a política do organizador.',
          'Se o evento for cancelado pelo organizador, ele é responsável por devolver os valores pagos.',
        ],
      },
      {
        title: 'Para organizações',
        items: [
          'Você deve ter autorização para representar a organização e para realizar os eventos que publicar.',
          'Use os dados dos participantes só para realizar o evento. Não os copie para outros fins nem os compartilhe.',
          'Taxas e plano do eHub estão na página de Preços. A cobrança mensal é feita no cartão cadastrado; sem pagamento, novas inscrições podem ser bloqueadas.',
          'Você é responsável pelo conteúdo que publicar (descrições, notícias, regulamentos, imagens).',
        ],
      },
      {
        title: 'Conteúdo e conduta',
        items: [
          'Não publique conteúdo ilegal, ofensivo, discriminatório, enganoso ou que viole direitos de outras pessoas.',
          'Ao publicar textos e imagens, você permite que o eHub os exiba na plataforma e em prévias de compartilhamento.',
          'Não tente burlar a segurança, acessar dados de outras pessoas ou sobrecarregar o serviço.',
        ],
      },
      {
        title: 'Responsabilidade e mudanças',
        items: [
          'Trabalhamos para manter o eHub disponível, mas podem ocorrer interrupções para manutenção ou por falhas de terceiros.',
          'Podemos atualizar estes termos; mudanças importantes serão avisadas no site ou por e-mail.',
          'Vale a legislação brasileira.',
        ],
      },
    ],
  },
}
