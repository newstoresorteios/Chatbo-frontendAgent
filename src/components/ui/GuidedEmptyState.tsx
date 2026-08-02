import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Headphones, Link, Megaphone, MessageSquare, Package, Radio, ShoppingCart, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ConversationsEmptyState({ filtered }: { filtered: boolean }) {
  const navigate = useNavigate();

  if (filtered) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Nenhuma conversa encontrada"
        description="Não há conversas com os filtros ou busca atuais. Tente outro canal ou limpe os filtros."
      />
    );
  }

  return (
    <EmptyState
      icon={Headphones}
      title="Nenhuma conversa ainda"
      description="As conversas aparecem quando leads enviam mensagem pelos canais conectados ou quando você testa o agente automático."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/configuracoes?tab=whatsapp')}>
            Configurar WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/robo')}>
            Testar agente
          </Button>
        </div>
      }
    />
  );
}

export function ConversationsSelectPrompt() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Selecione uma conversa"
      description="Escolha um atendimento na lista ao lado ou aguarde novas mensagens pelos canais conectados."
    />
  );
}

export function CampaignsEmptyState({ onCreate }: { onCreate: () => void }) {
  const navigate = useNavigate();

  return (
    <EmptyState
      icon={Megaphone}
      title="Nenhuma campanha criada"
      description="Crie campanhas para compradores e leads sincronizados. O disparo real exige canais conectados."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={onCreate}>
            Criar campanha
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/configuracoes?tab=mercos')}>
            Ver fontes de dados
          </Button>
        </div>
      }
    />
  );
}

export function CustomersEmptyState({ searched }: { searched: boolean }) {
  const navigate = useNavigate();

  if (searched) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum cliente encontrado"
        description="Não há compradores ou leads que correspondam à sua busca. Tente outro nome, e-mail ou telefone."
      />
    );
  }

  return (
    <EmptyState
      icon={Users}
      title="Nenhum cliente disponível"
      description="Leads e compradores aparecem quando uma fonte de dados conectada disponibiliza registros para a operação."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={() => navigate('/configuracoes?tab=mercos')}>
            Ver fontes de dados
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/configuracoes?tab=sistema')}>
            Ver status do sistema
          </Button>
        </div>
      }
    />
  );
}

export function ChannelsEmptyState({ onRegisterWhatsApp }: { onRegisterWhatsApp?: () => void }) {
  const navigate = useNavigate();

  return (
    <EmptyState
      icon={Radio}
      title="Nenhum canal configurado"
      description="Cadastre canais comerciais para que a equipe e o agente acompanhem conversas reais."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          {onRegisterWhatsApp && (
            <Button size="sm" onClick={onRegisterWhatsApp}>
              Cadastrar WhatsApp
            </Button>
          )}
          <Button variant={onRegisterWhatsApp ? 'outline' : 'primary'} size="sm" onClick={() => navigate('/configuracoes?tab=whatsapp')}>
            Configurar tokens Meta
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/configuracoes?tab=sistema')}>
            Ver checklist
          </Button>
        </div>
      }
    />
  );
}

export function ProductsEmptyState({ searched }: { searched: boolean }) {
  const navigate = useNavigate();

  if (searched) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhum produto encontrado"
        description="Não há itens que correspondam à busca ou categoria. Tente outro termo ou limpe os filtros."
      />
    );
  }

  return (
    <EmptyState
      icon={Package}
      title="Catálogo vazio"
      description="O catálogo comercial aparece quando uma fonte de dados conectada disponibiliza produtos para o agente e para a equipe."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={() => navigate('/configuracoes?tab=mercos')}>
            Ver fontes de dados
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/configuracoes?tab=sistema')}>
            Ver status do sistema
          </Button>
        </div>
      }
    />
  );
}

export function CatalogSourceHint() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/configuracoes?tab=mercos')}
      className="flex w-full items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left text-sm text-blue-950 transition-colors hover:bg-blue-100/80 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/50"
    >
      <Link className="h-4 w-4 shrink-0" />
      <p>
        Catálogo comercial disponível para o agente e para a equipe. Use Atualizar catálogo para revisar preços e estoque.
      </p>
    </button>
  );
}

export function CustomerSourceHint() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/configuracoes?tab=mercos')}
      className="flex w-full items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left text-sm text-blue-950 transition-colors hover:bg-blue-100/80 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/50"
    >
      <Link className="h-4 w-4 shrink-0" />
      <p>
        Leads e compradores reunidos pelos canais da empresa. Atualizações dependem das fontes de dados conectadas.
      </p>
    </button>
  );
}

export function OrdersEmptyState({ searched }: { searched: boolean }) {
  const navigate = useNavigate();

  if (searched) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Nenhum pedido encontrado"
        description="Não há pedidos com os filtros ou busca atuais. Tente outro termo ou limpe os filtros."
      />
    );
  }

  return (
    <EmptyState
      icon={ShoppingCart}
      title="Nenhum pedido ainda"
      description="Pedidos fechados pelo agente e pelos canais conectados aparecem aqui automaticamente."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={() => navigate('/configuracoes?tab=mercos')}>
            Ver fontes de dados
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/configuracoes?tab=sistema')}>
            Ver status do sistema
          </Button>
        </div>
      }
    />
  );
}

export function OrdersMercosHint() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/configuracoes?tab=mercos')}
      className="flex w-full items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left text-sm text-blue-950 transition-colors hover:bg-blue-100/80 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/50"
    >
      <Link className="h-4 w-4 shrink-0" />
      <p>
        Pedidos dos canais conectados e da fonte comercial atual. Vendas do agente aparecem ao fechar no atendimento.
      </p>
    </button>
  );
}
