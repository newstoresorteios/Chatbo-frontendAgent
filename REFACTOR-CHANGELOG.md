# Refactor frontend NITRUS

## Etapa 0 - Checkpoint, rollback e inventário

### Estado Git

- Branch original: `jpedro`
- Commit base/checkpoint: `4b8ae93118601d85248f6a49be10a732e7e323ff`
- Branch de backup: `backup/nitrus-before-frontend-refactor`
- Tag: `nitrus-before-frontend-refactor`

### Inventário da plataforma

| Componente atual | Responsabilidade | Onde é usado | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| `AuthContext` | Sessão, login, cadastro, logout e perfil | `App.tsx`, rotas e páginas autenticadas | Adaptar | Base funcional; receberá normalização de sessão e `USE_MOCK` centralizado. |
| `ProtectedRoute` / `PublicRoute` | Controle de acesso autenticado/público | `src/routes/index.tsx` | Manter | Já resolve autenticação sem duplicar guard. |
| `PermissionRoute` | Proteção por permissões do workspace | Rotas restritas | Manter | Será reaproveitado para equipe, integrações e relatórios. |
| `usePermissions` | Consulta permissões e perfil | Sidebar, settings e páginas restritas | Manter | Contrato atual preservado. |
| `AppLayout` | Layout do painel autenticado | Rotas internas | Reaproveitar | Será encapsulado por `WorkspaceLayout`. |
| `Header`, `Sidebar`, `Logo` | Navegação e identidade | `AppLayout` | Adaptar | Sidebar será reorganizada sem recriar layout. |
| `ThemeContext`, `NotificationContext`, `ChatContext` | Estado transversal do app | `App.tsx` | Manter | Funcionais e fora do escopo de reescrita. |
| `CustomersPage` | Lista e detalhes de compradores/leads | Rotas `/contatos` e `/clientes` | Adaptar | Remover edição falsa e tornar `/clientes` canônica. |
| `customerStore` | Overrides em memória de sync | `CustomersPage` | Adaptar | Manter apenas override de sincronização; remover `customerEditStore`. |
| `ProductsPage` | Lista e detalhes do catálogo | Rota `/produtos` | Adaptar | Categorias serão derivadas dos produtos recebidos. |
| `SettingsPage` | Configurações visíveis por perfil | Rota `/configuracoes` | Adaptar | Reorganizar tabs e visibilidade sem remover painéis. |
| `GeneralSettingsPanels` | Empresa, notificações, permissões e segurança | `SettingsPage` | Adaptar | Ajustar nomenclatura e permissão de empresa. |
| `UsersSettingsPanel` | Usuários com login | Settings | Adaptar | Renomear para Equipe e acessos; preservar service. |
| `MercosSettingsPanel` | Status e sync do provedor atual | Settings | Manter | Funções existentes preservadas; textos gerais na navegação. |
| `WhatsAppSettingsPanel` | Canal WhatsApp e credenciais | Settings | Manter com visibilidade restrita | Credenciais brutas só para `system_admin`. |
| `SystemStatusPanel` | Diagnóstico técnico | Settings | Manter com visibilidade restrita | Não deve aparecer para usuários comuns. |
| `services/*.service.ts` | Contratos do backend | Hooks e páginas | Manter | Endpoints e payloads não serão alterados. |
| `useQueries` | React Query para dados principais | Páginas | Manter | Camada funcional reaproveitada. |
| `GuidedEmptyState` | Estados vazios e hints | Páginas operacionais | Adaptar | Neutralizar hints de clientes/produtos. |
| `LandingPage` | Site público | Rota `/` | Manter | Não será alterada nesta fase. |
| `RegisterPage` | Cadastro | Rota `/cadastro` | Adaptar | Apenas comunicação empresarial, payload preservado. |

### Arquivos alterados

- `scripts/rollback-frontend-refactor.ps1`
- `ROLLBACK-REFACTOR.bat`
- `REFACTOR-ROLLBACK.md`
- `REFACTOR-CHANGELOG.md`

### Componentes reaproveitados

- `AuthContext`
- `ProtectedRoute`
- `PublicRoute`
- `PermissionRoute`
- `usePermissions`
- `AppLayout`
- `Header`
- `Sidebar`
- `Logo`
- React Query hooks e services existentes

### Comportamento preservado

- Nenhum endpoint alterado.
- Nenhum webhook alterado.
- Nenhuma integração alterada.
- Nenhuma dependência instalada.
- Landing preservada.

### Validações executadas

- Pendente: `npm run build`
- Pendente: `npm run lint`

### Pendências

- Centralizar `USE_MOCK`.
- Remover edição falsa de clientes.
- Criar normalização de sessão e contexto de workspace.
- Reorganizar rotas/layouts/settings/sidebar.
- Neutralizar textos específicos.

### Riscos conhecidos

- Lint pode apontar problemas preexistentes após as primeiras alterações; serão separados dos introduzidos.

## Etapa 1 - Mock, clientes e separação conceitual

### Arquivos alterados

- `src/config/runtime.ts`
- `src/contexts/AuthContext.tsx`
- `src/services/data.service.ts`
- `src/services/dashboard.service.ts`
- `src/services/conversations.service.ts`
- `src/services/agent.service.ts`
- `src/services/sales.service.ts`
- `src/services/platform.service.ts`
- `src/services/mercos.service.ts`
- `src/store/customerStore.ts`
- `src/pages/CustomersPage.tsx`
- `src/pages/ProductsPage.tsx`
- `src/components/ui/GuidedEmptyState.tsx`
- `src/routes/index.tsx`

### Componentes reaproveitados

- `CustomersPage`, `CustomerCard`, `Table`, `Modal`, `Pagination`, `Search`.
- `ProductsPage`, `ProductCard`, `useProducts`, `useMercosSync`.
- Services e endpoints existentes.

### Componentes removidos

- `customerEditStore` foi removido de `src/store/customerStore.ts`.

### Comportamento preservado

- Consulta de clientes continua usando `GET /clientes`.
- Consulta de produtos continua usando `GET /produtos`.
- Sincronização continua chamando o hook/service existente.
- `/contatos` foi mantida como alias, redirecionando para `/clientes`.

### Validações executadas

- `npm run build`: passou fora do sandbox após `spawn EPERM` do esbuild no sandbox.
- `npm run lint`: passou sem erros; restam 5 warnings preexistentes.

### Pendências

- Tipos de conta e normalizador de sessão.
- Contexto de workspace.
- Layouts e guards.
- Reorganização completa de settings/sidebar.

### Riscos conhecidos

- Categorias de produtos agora são derivadas da página carregada atual; sem endpoint específico de categorias, categorias fora da página corrente aparecem conforme os produtos recebidos.

## Etapa 2 - Tipos de conta, sessão e workspace

### Arquivos alterados

- `src/types/index.ts`
- `src/utils/sessionScope.ts`
- `src/contexts/AuthContext.tsx`
- `src/contexts/WorkspaceContext.tsx`
- `src/App.tsx`

### Componentes reaproveitados

- `AuthContext` foi mantido como fonte da sessão.
- Storage keys antigas foram preservadas.

### Comportamento preservado

- Usuários legados sem `accountType` entram como `workspace_user`.
- Usuários legados sem `onboardingStatus` entram como `complete`.
- `system_admin` só existe se o backend enviar explicitamente.
- Nenhum endpoint novo foi chamado.

### Validações executadas

- `npm run build`: passou.
- `npm run lint`: passou sem erros.

## Etapa 3 - Layouts, guards, rotas e settings

### Arquivos criados

- `src/layouts/PublicSiteLayout.tsx`
- `src/layouts/WorkspaceLayout.tsx`
- `src/layouts/SystemAdminLayout.tsx`
- `src/layouts/OnboardingLayout.tsx`
- `src/routes/WorkspaceRoute.tsx`
- `src/routes/SystemAdminRoute.tsx`
- `src/routes/OnboardingRoute.tsx`

### Arquivos alterados

- `src/routes/index.tsx`
- `src/pages/SettingsPage.tsx`
- `src/components/settings/GeneralSettingsPanels.tsx`
- `src/components/settings/SystemStatusPanel.tsx`
- `src/components/settings/WhatsAppSettingsPanel.tsx`

### Componentes reaproveitados

- `AppLayout` foi reaproveitado por `WorkspaceLayout`.
- `ProtectedRoute`, `PublicRoute`, `PermissionRoute` e `usePermissions` foram preservados.
- Painéis de settings existentes foram reorganizados sem duplicar services.

### Comportamento preservado

- Landing, login e rotas existentes continuam funcionando.
- `/clientes` é canônica.
- `/contatos` redireciona para `/clientes`.
- `Equipe e acessos` continua protegida por `manageUsers`.
- Configurações técnicas ficam restritas a `accountType === 'system_admin'`.

### Validações executadas

- `npm run build`: passou.
- `npm run lint`: passou sem erros.

## Etapa 4 - Textos, categorias e nomenclatura

### Arquivos alterados

- `src/pages/ProductsPage.tsx`
- `src/pages/CustomersPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/components/ui/GuidedEmptyState.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/services/ai/contextBuilder.ts`
- `src/services/ai/intelligentEngine.ts`
- `src/services/ai/openaiProvider.ts`
- `src/services/agent.service.ts`
- `src/services/sales.service.ts`

### Componentes extraídos/adaptados

- `CatalogSourceHint`
- `CustomerSourceHint`

### Comportamento preservado

- Sincronização continua usando os mesmos hooks/services.
- Cadastro preserva payload atual.
- Landing não foi alterada.
- Rotas antigas foram mantidas como aliases.

### Validações executadas

- `npm run build`: passou.
- `npm run lint`: passou sem erros.

## Etapa 5 - Decomposição controlada

### Decisão

- Não houve decomposição adicional de páginas monolíticas nesta fase além da extração/renomeação dos hints, porque os componentes existentes já atendiam ao escopo sem duplicação.

### Componentes removidos

- `customerEditStore`, por não possuir persistência real e só simular edição no navegador.

### Validação final

- `npm run build`: passou fora do sandbox; no sandbox o esbuild falha com `spawn EPERM`.
- `npm run lint`: passou sem erros.
- Warnings remanescentes:
  - Fast Refresh em contexts existentes (`AuthContext`, `ChatContext`, `NotificationContext`, `ThemeContext`) e novo `WorkspaceContext`.
  - `ConversationsPage` possui warning preexistente de dependência de `useMemo`.

### Rollback

- Simulação executada com confirmação inválida `CANCEL`.
- O script mostrou branch, commits, arquivos alterados e cancelou sem executar reset.

### Riscos conhecidos

- `tsconfig.tsbuildinfo` foi atualizado pelo `tsc -b` durante a validação.
- `MercosSettingsPanel`, `OrdersPage`, `CampaignsPage` e telas dedicadas de integração ainda mencionam Mercos/WhatsApp quando tratam explicitamente dessas integrações já existentes.

## Fase 2 - Decomposição do Dashboard

### Início

- Branch confirmada: `jpedro`
- Tag de rollback confirmada: `nitrus-before-frontend-refactor`
- Branch de backup confirmada: `backup/nitrus-before-frontend-refactor`
- Dashboard antes da decomposição: `src/pages/DashboardPage.tsx` com 1585 linhas.

### Auditoria do Dashboard atual

| Bloco | Responsabilidade | Dependências | Dados recebidos | Ações executadas | Destino planejado |
| --- | --- | --- | --- | --- | --- |
| Consultas React Query | Buscar dados do painel e domínio comercial | `useDashboard`, `useConversations`, `useCustomers`, `useProducts`, `useOrders`, `useChannels`, `useSalesMetrics`, `useAgentStatus`, `useMercosStatus`, `useSystemStatus` | Dashboard, conversas, clientes, produtos, pedidos, canais, métricas, IA, integrações e status técnico | `refetch` do dashboard | Permanecer em `DashboardPage.tsx` como orquestração |
| Estados de filtros | Controlar período, produto, cliente, status e canal | `useState` | Valores selecionados na UI | Atualiza filtros locais sem persistência | `useDashboardFilters` |
| Modo apresentação | Ocultar seções secundárias e checklist | `useState` | Boolean local | Alterna visual sem alterar rota/dados | `usePresentationMode` |
| Navegação interna | Âncoras, seção ativa, esconder/mostrar ao scroll | `useEffect`, DOM `app-scroll-container`, `IntersectionObserver` | IDs das seções | Atualiza `activeSection`, `filtersOpen`, `isDashboardNavHidden` | `useDashboardNavigation` + `DashboardInternalNav` |
| Pergunte ao NITRUS | Consulta IA existente | `agentService.chat`, `useMutation` | Texto, primeira conversa como contexto | Chama `agentService.chat`, exibe loading/erro/resposta | `AskNitrosSection` |
| Helpers visuais | Section, KPI, mini métricas, tabela compacta, tooltip e vazio | `cn`, `motion`, recharts | Props visuais | Renderização apenas | `components/DashboardSection`, `KpiCard`, `MiniMetric`, `DashboardDataTable`, `DashboardChartTooltip`, `EmptyInsight` |
| Lead scoring | Classificar conversas por intenção, recência, fila e histórico | `Conversation`, `Customer`, `Order`, regex local | Conversas filtradas, clientes, pedidos filtrados | Calcula score, label, motivo e próxima ação | `utils/leadScoring.ts` |
| Previsão comercial | Cenários conservador/provável/otimista | Métricas comerciais, pedidos, stats | Pipeline, retenção, conversão, fila e ticket médio | Calcula previsões e taxa provável | `utils/revenueForecast.ts` |
| Ranking de clientes | Fiéis, recentes e retenção | Clientes | `Customer[]` | Ordena e classifica sem mutar entrada | `utils/customerRanking.ts` |
| Rotina comercial | Montar tarefas do dia sem persistir | Stats, lead scores, clientes retenção, produtos | Filas, leads, retenção, estoque | Gera lista local de ações | `utils/routineBuilder.ts` |
| Capacidade e status | Status operacional, tom e saúde do pipeline | Stats, métricas, retenção, conversão | Filas, pipeline, funil | Calcula status e gargalo | `utils/capacityStatus.ts` |
| Filtros derivados | Aplicar período/filtros a conversas, pedidos e produtos | Dados carregados e filtros | Listas completas | Retorna listas filtradas | `utils/dashboardFilters.ts` |
| Header executivo | Saudação, status, ações principais | `user`, `refetch`, `isFetching`, modo apresentação | Nome, status operacional | Navega para atendimento/pergunte, refetch, alterna apresentação | `DashboardExecutiveHeader` |
| Resumo geral | KPIs executivos | KPIs calculados | `ExecutiveKpi[]` | Renderização | `BusinessSummarySection` |
| Resumo NITRUS | Diagnóstico, risco, oportunidade, credibilidade | Métricas calculadas, canais, IA | Strings e contagens | Renderização | `NitrosExecutiveSummary` |
| Previsão | Cards e gráfico de cenários | Recharts, forecast | Valores calculados | Renderização | `RevenueForecastSection` |
| Pipeline | Saúde, gargalo, funil | Métricas comerciais | Saúde, funil, oportunidades | Renderização | `PipelineHealthSection` |
| Leads | Tabela de score | Lead scores | Leads calculados | Renderização | `LeadScoringSection` |
| Rotina | Cards de tarefas locais | Routine items | Itens calculados | Links/âncoras sem persistência | `CommercialRoutineSection` |
| Operação | Capacidade de atendimento | Stats/status | Métricas de carga | Renderização | `ServiceCapacitySection` |
| Clientes fiéis | Tabela de clientes | Ranking de clientes | Clientes ordenados | Renderização | `LoyalCustomersSection` |
| Clientes recentes | Cards de clientes recentes | Clientes | Clientes ordenados | Renderização | `RecentCustomersSection` |
| Retenção | Tabela de reativação | Clientes em risco | Clientes filtrados | Renderização | `RetentionSection` |
| Produtos | Catálogo e modal honesto | Produtos filtrados, sort, selectedProduct | Produtos reais | Ordena, abre modal sem salvar | `ProductCatalogSection`; modal orquestrado na página |
| Desempenho | Métricas e gráficos | Recharts, séries do dashboard | Charts e métricas | Renderização | `CommercialPerformanceSection` |
| Credibilidade | Status de dados, canais, IA e integrações existentes | Status hooks, Recharts pie | Canais, status e contagens | Renderização | `OperationCredibilitySection` |
| Recomendações | Próximas ações sugeridas localmente | Dados calculados | Recomendações | Links/âncoras | `PerformanceRecommendationsSection` |

### Definição futura reservada

- Persona do agente será registrada apenas como item futuro de navegação/configuração, sem rota ou item clicável nesta fase.

### Estrutura criada

- `src/features/dashboard/components/`
- `src/features/dashboard/hooks/`
- `src/features/dashboard/utils/`
- `src/features/dashboard/types.ts`
- `src/features/dashboard/constants.ts`
- `src/features/dashboard/index.ts`

### Componentes extraídos

- `DashboardExecutiveHeader`
- `DashboardInternalNav`
- `BusinessSummarySection`
- `NitrosExecutiveSummary`
- `RevenueForecastSection`
- `PipelineHealthSection`
- `LeadScoringSection`
- `CommercialRoutineSection`
- `ServiceCapacitySection`
- `LoyalCustomersSection`
- `RecentCustomersSection`
- `RetentionSection`
- `ProductCatalogSection`
- `CommercialPerformanceSection`
- `AskNitrosSection`
- `OperationCredibilitySection`
- `PerformanceRecommendationsSection`
- `DashboardSection`
- `KpiCard`
- `MiniMetric`
- `CompactSelect`
- `DashboardDataTable`
- `DashboardChartTooltip`

### Hooks extraídos

- `useDashboardFilters`
- `useDashboardNavigation`
- `usePresentationMode`
- `useDashboardInsights` contém builders puros de insights/recomendações, sem React Query.

### Utilitários puros criados

- `leadScoring.ts`
- `revenueForecast.ts`
- `customerRanking.ts`
- `routineBuilder.ts`
- `capacityStatus.ts`
- `dashboardFilters.ts`
- `channelVolume.ts`
- `dateHelpers.ts`
- `style.ts`

### Componentes e serviços reaproveitados

- `SetupChecklist`
- `Modal`
- `Button`
- `Input`
- `Select`
- `Avatar`
- `ChannelBadge`
- `Loading`
- `Skeleton`
- `agentService.chat`
- Todos os hooks de dados existentes do dashboard foram preservados.

### Comportamento preservado

- `DashboardPage.tsx` continua chamando as mesmas queries principais.
- Filtros globais permanecem locais e sem persistência.
- Navegação interna continua por âncora.
- Barra interna continua escondendo ao rolar para baixo e voltando ao rolar para cima.
- Modo apresentação continua local e não altera rota/dados.
- Pergunte ao NITRUS continua usando `agentService.chat`.
- Produtos seguem sem edição real; o botão de editar foi desabilitado com explicação honesta.
- Nenhum mock novo, endpoint novo ou salvamento local falso foi criado.

### Lazy loading de rotas

Rotas protegidas pesadas com `React.lazy` e `Suspense`:

- `/dashboard`
- `/atendimento`
- `/relatorios`
- `/insights`
- `/produtos`
- `/pedidos`
- `/copiloto`

Fallback reaproveita `Loading`.

### Tamanho do Dashboard

- Antes: 1585 linhas.
- Depois: 467 linhas.

### Validações da Fase 2

- `npm run lint`: passou sem erros.
- `npm run build`: passou fora do sandbox; o esbuild exige execução fora do sandbox por `spawn EPERM`.
- `http://localhost:5173/dashboard`: respondeu HTTP 200.

### Warnings restantes

- Fast Refresh em contexts já existentes: `AuthContext`, `ChatContext`, `NotificationContext`, `ThemeContext`, `WorkspaceContext`.
- Warning preexistente em `ConversationsPage` sobre dependência de `useMemo`.
- Warning do Vite sobre chunk principal acima de 500 kB, embora o build agora gere chunks separados para páginas pesadas.

### Garantias de escopo

- Backend não alterado.
- Endpoints não alterados.
- Payloads não alterados.
- Webhooks não alterados.
- WhatsApp não alterado.
- Mercos não alterado.
- Nenhuma dependência instalada.
- Nenhuma rota falsa de persona criada.
- Rollback original segue válido com a tag `nitrus-before-frontend-refactor` e a branch `backup/nitrus-before-frontend-refactor`.
