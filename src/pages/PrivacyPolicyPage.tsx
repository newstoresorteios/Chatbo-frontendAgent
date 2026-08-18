import { LandingFooter, LandingNavbar } from '@/components/landing/LandingLayout';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const UPDATED_AT = '18 de agosto de 2026';
const CONTACT_EMAIL = 'privacidade@tironitech.com.br';
const SUPPORT_EMAIL = 'suporte@tironitech.com.br';

const sections = [
  { id: 'quem-somos', title: '1. Quem somos' },
  { id: 'abrangencia', title: '2. Abrangência desta política' },
  { id: 'dados', title: '3. Quais dados coletamos' },
  { id: 'finalidades', title: '4. Como usamos os dados' },
  { id: 'bases-legais', title: '5. Bases legais (LGPD)' },
  { id: 'canais', title: '6. Conversas e canais (WhatsApp, Instagram e outros)' },
  { id: 'compartilhamento', title: '7. Compartilhamento e operadores' },
  { id: 'cookies', title: '8. Cookies e tecnologias semelhantes' },
  { id: 'seguranca', title: '9. Armazenamento e segurança' },
  { id: 'transferencias', title: '10. Transferências internacionais' },
  { id: 'direitos', title: '11. Seus direitos' },
  { id: 'retencao', title: '12. Prazo de retenção' },
  { id: 'alteracoes', title: '13. Alterações desta política' },
  { id: 'contato', title: '14. Contato' },
];

export function PrivacyPolicyPage() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    const previous = document.title;
    document.title = 'Política de Privacidade | ChatBô';
    return () => {
      document.documentElement.classList.remove('dark');
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <LandingNavbar />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-blue-600/15 blur-[110px]" />
          <div className="absolute top-40 right-0 h-64 w-64 rounded-full bg-red-600/10 blur-[90px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>

          <div className="flex items-start gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:flex">
              <Shield className="h-7 w-7 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                ChatBô · Tironi Tech
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Política de Privacidade
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                Esta política explica como o ChatBô coleta, usa, armazena e protege dados pessoais,
                em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
              </p>
              <p className="mt-2 text-sm text-slate-500">Última atualização: {UPDATED_AT}</p>
            </div>
          </div>

          <nav className="mt-10 rounded-2xl border border-white/10 bg-gray-900/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Nesta página
            </p>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="mt-12 space-y-12 text-slate-300">
            <section id="quem-somos" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">1. Quem somos</h2>
              <p className="mt-3 leading-relaxed">
                O ChatBô é uma plataforma de atendimento e inteligência comercial da{' '}
                <strong className="text-white">Tironi Tech</strong>, disponível em{' '}
                <a href="https://chatbo.com.br" className="text-cyan-300 hover:underline">
                  chatbo.com.br
                </a>
                . Para dados de contas, cadastro, faturamento e uso da plataforma, a Tironi Tech
                atua como controladora. Para mensagens e contatos dos clientes finais das empresas
                que usam o ChatBô, a empresa contratante é, em regra, a controladora, e a Tironi
                Tech atua como operadora.
              </p>
            </section>

            <section id="abrangencia" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">
                2. Abrangência desta política
              </h2>
              <p className="mt-3 leading-relaxed">
                Esta política se aplica ao site, à plataforma de atendimento, ao cadastro de
                usuários, às APIs e às integrações do ChatBô, inclusive canais como WhatsApp,
                Instagram, Facebook, Telegram, e-mail e webchat. Ao criar uma conta, acessar o
                site ou utilizar os serviços, você declara ter lido esta política.
              </p>
            </section>

            <section id="dados" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">
                3. Quais dados coletamos
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
                <li>
                  <strong className="text-white">Cadastro e conta:</strong> nome, e-mail, senha
                  (armazenada de forma criptografada), empresa, perfil de acesso e dados de
                  faturamento quando houver assinatura.
                </li>
                <li>
                  <strong className="text-white">Uso da plataforma:</strong> registros de acesso,
                  logs técnicos, endereço IP, tipo de dispositivo, páginas visitadas e eventos de
                  produto necessários para segurança e melhoria do serviço.
                </li>
                <li>
                  <strong className="text-white">Atendimento e CRM:</strong> conversas, contatos,
                  telefones, identificadores de canal, histórico de mensagens, reservas, funil
                  comercial e anotações feitas pela equipe da empresa contratante.
                </li>
                <li>
                  <strong className="text-white">Inteligência artificial:</strong> trechos de
                  conversa, persona, memórias comerciais e sugestões geradas para apoiar o
                  atendimento, sempre no contexto da empresa contratante.
                </li>
                <li>
                  <strong className="text-white">Integrações:</strong> dados necessários para
                  operar canais e sistemas conectados pela empresa (por exemplo provedores de
                  mensageria, catálogo, pagamentos ou e-commerce).
                </li>
              </ul>
            </section>

            <section id="finalidades" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">
                4. Como usamos os dados
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
                <li>Prestar, autenticar e manter o serviço ChatBô.</li>
                <li>Permitir atendimento omnichannel, copilot e agente automático.</li>
                <li>Gerar métricas, relatórios e painéis comerciais da empresa contratante.</li>
                <li>Cumprir obrigações legais, fiscais e de segurança.</li>
                <li>Comunicar avisos operacionais, suporte e alterações relevantes do serviço.</li>
                <li>Melhorar estabilidade, desempenho e prevenção a fraudes ou abuso.</li>
              </ul>
              <p className="mt-3 leading-relaxed">
                Não vendemos dados pessoais. Não usamos o conteúdo das conversas dos clientes
                finais para treinar modelos públicos de terceiros fora do contrato da empresa
                contratante.
              </p>
            </section>

            <section id="bases-legais" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">5. Bases legais (LGPD)</h2>
              <p className="mt-3 leading-relaxed">
                Tratamos dados com base nas hipóteses do art. 7º da LGPD, principalmente:
                execução de contrato (prestação do SaaS), legítimo interesse (segurança, melhoria
                do produto e suporte), cumprimento de obrigação legal e, quando aplicável,
                consentimento. A empresa contratante é responsável por ter base legal própria
                para tratar dados dos seus clientes nos canais que conectar ao ChatBô.
              </p>
            </section>

            <section id="canais" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">
                6. Conversas e canais (WhatsApp, Instagram e outros)
              </h2>
              <p className="mt-3 leading-relaxed">
                Mensagens trocadas com leads e clientes circulam pelos provedores oficiais de
                cada canal e são sincronizadas na Central de Conversão para a empresa
                contratante acompanhar o atendimento. A Tironi Tech processa esses conteúdos
                apenas para operar o ChatBô, sob instrução da empresa. Cabe à empresa informar
                seus clientes sobre o uso de canais digitais, agentes automáticos e registro de
                conversas, bem como respeitar as políticas do WhatsApp, Meta, Telegram e demais
                provedores.
              </p>
            </section>

            <section id="compartilhamento" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">
                7. Compartilhamento e operadores
              </h2>
              <p className="mt-3 leading-relaxed">
                Compartilhamos dados somente com provedores essenciais à operação, sob contratos
                de confidencialidade e proteção de dados, por exemplo hospedagem, banco de dados,
                envio de mensagens, autenticação, infraestrutura de nuvem e serviços de IA.
                Também poderemos compartilhar dados se exigido por lei, ordem judicial ou para
                proteger direitos da Tironi Tech, dos usuários ou de terceiros.
              </p>
            </section>

            <section id="cookies" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">
                8. Cookies e tecnologias semelhantes
              </h2>
              <p className="mt-3 leading-relaxed">
                Utilizamos cookies e armazenamento local estritamente necessários para manter a
                sessão autenticada, lembrar preferências da interface e garantir a segurança do
                acesso. Cookies analíticos, quando usados, servem para entender o uso do site e
                melhorar a experiência. Você pode bloquear cookies no navegador, mas isso pode
                impedir o login ou o funcionamento de partes da plataforma.
              </p>
            </section>

            <section id="seguranca" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">
                9. Armazenamento e segurança
              </h2>
              <p className="mt-3 leading-relaxed">
                Adotamos medidas técnicas e organizacionais razoáveis, incluindo criptografia em
                trânsito, controle de acesso por perfil, isolamento por empresa (workspace) e
                monitoramento de incidentes. Nenhum sistema é 100% seguro. Se identificarmos um
                incidente relevante que afete seus dados, comunicaremos as partes e a
                autoridade, quando a lei exigir.
              </p>
            </section>

            <section id="transferencias" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">
                10. Transferências internacionais
              </h2>
              <p className="mt-3 leading-relaxed">
                Alguns operadores podem processar dados fora do Brasil. Nesses casos, buscamos
                garantias adequadas de proteção, como cláusulas contratuais e padrões de
                segurança compatíveis com a LGPD, para que o nível de proteção não seja inferior
                ao previsto na legislação brasileira.
              </p>
            </section>

            <section id="direitos" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">11. Seus direitos</h2>
              <p className="mt-3 leading-relaxed">
                Nos termos do art. 18 da LGPD, você pode solicitar confirmação de tratamento,
                acesso, correção, anonimização, portabilidade, informação sobre compartilhamentos,
                revogação de consentimento e eliminação de dados desnecessários. Pedidos de
                titulares de clientes finais devem ser dirigidos primeiro à empresa que os
                atendeu. Pedidos relativos à conta ChatBô podem ser feitos pelo e-mail{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-300 hover:underline">
                  {CONTACT_EMAIL}
                </a>
                . Poderemos solicitar informações para confirmar a identidade do solicitante.
              </p>
            </section>

            <section id="retencao" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">12. Prazo de retenção</h2>
              <p className="mt-3 leading-relaxed">
                Mantemos os dados pelo tempo necessário para cumprir as finalidades desta
                política, o contrato com a empresa contratante e obrigações legais. Após o
                encerramento da conta ou pedido de exclusão, dados poderão permanecer em backups
                e logs pelo prazo mínimo exigido para auditoria, defesa de direitos e
                cumprimento de lei, e depois serão eliminados ou anonimizados.
              </p>
            </section>

            <section id="alteracoes" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">
                13. Alterações desta política
              </h2>
              <p className="mt-3 leading-relaxed">
                Podemos atualizar esta política para refletir melhorias do ChatBô ou exigências
                legais. A data da última atualização aparece no topo desta página. Mudanças
                relevantes serão comunicadas no site, por e-mail ou aviso na plataforma. O uso
                continuado do serviço após a publicação indica ciência da nova versão.
              </p>
            </section>

            <section id="contato" className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold text-white">14. Contato</h2>
              <p className="mt-3 leading-relaxed">
                Dúvidas, solicitações de titular ou reclamações sobre privacidade:
              </p>
              <ul className="mt-3 space-y-1">
                <li>
                  Privacidade:{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-300 hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                </li>
                <li>
                  Suporte:{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-cyan-300 hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                </li>
                <li>
                  Site:{' '}
                  <a href="https://chatbo.com.br" className="text-cyan-300 hover:underline">
                    chatbo.com.br
                  </a>
                </li>
              </ul>
            </section>
          </article>

          <div className="mt-12 flex flex-col gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-950/40 via-gray-900 to-red-950/20 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">Precisa exercer um direito da LGPD?</p>
              <p className="mt-1 text-sm text-slate-400">
                Envie sua solicitação e retornaremos pelos canais oficiais da Tironi Tech.
              </p>
            </div>
            <Button onClick={() => { window.location.href = `mailto:${CONTACT_EMAIL}`; }}>
              <Mail className="h-4 w-4" /> Falar com privacidade
            </Button>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
