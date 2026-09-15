import type { AgentConfigurationField } from '@/services/agentConfiguration.service';

export interface ConfigurationGuidance {
  label: string;
  purpose: string;
  whenUsed: string;
  section: string;
}

// Operator documentation follows the consumers in NSAgent/app, not the raw environment variable name.
const help: Record<string, ConfigurationGuidance> = {};
function section(name: string, whenUsed: string, rows: string) {
  for (const line of rows.trim().split('\n')) {
    const [key, label, purpose, when] = line.trim().split('|');
    help[key] = { label, purpose, whenUsed: when || whenUsed, section: name };
  }
}

section('Regras da loja', 'Quando o assunto da conversa exige consultar a política comercial da loja.', `
acceptsTradeIn|Permuta e avaliação pela equipe|Informa se a loja aceita relógios como parte da negociação. A avaliação de valor é encaminhada à equipe humana.|Quando o cliente pede troca, venda de usado ou avaliação de uma peça.
agentCanAppraise|Avaliação de preço pelo agente|Registra a restrição de estimar o valor de peças do cliente. O agente depende de avaliação humana; este campo é protegido.|Ao orientar uma permuta ou encaminhar uma avaliação.
checkoutMode|Onde finalizar a compra|Escolhe entre concluir pelo site oficial ou pelo atendimento assistido no chat. As integrações de pagamento precisam estar disponíveis.|Quando o cliente decide comprar e o agente apresenta a forma de concluir o pedido.
requireQualificationBeforeCatalog|Qualificar antes de buscar produtos|Define a regra operacional de coletar preferências antes de recomendar produtos, usada na composição das regras da persona.|Quando o cliente pede opções sem informar modelo ou preferências suficientes.
pixDiscountPercent|Desconto cadastrado para PIX (%)|Informa o percentual oficial usado nas orientações comerciais. Preços e condições da compra continuam sujeitos à consulta do produto e do pagamento.|Ao explicar condições de pagamento e descontos.
maxCatalogOptions|Opções por recomendação|Limita quantas opções o agente pode apresentar em uma recomendação pelas regras comerciais.|Ao montar uma lista de produtos para o cliente.
business.site_url|Site de sorteios|Endereço oficial usado nas orientações de cadastro, participação e Cartão Presente.|Quando o agente indica o site de sorteios ou pede atualização do cadastro.
business.store_url|Site da loja|Endereço oficial da loja usado nas orientações de compra e uso de crédito.|Quando o agente indica a loja ou explica onde usar o Cartão Presente.
business.store_pronta_entrega_url|Página de pronta entrega|Endereço da seleção oficial de produtos de pronta entrega.|Quando o agente orienta sobre produtos disponíveis para entrega mais rápida.
business.ns_sales_whatsapp|WhatsApp da equipe comercial|Número de contato apresentado para atendimento humano da loja.|Quando o cliente precisa falar com a equipe de vendas ou esclarecer dúvidas.
business.credit_bands|Faixas de uso do Cartão Presente|Relaciona o saldo mínimo e máximo de crédito ao valor de compra exigido. Informe os valores em reais; o sistema os salva em centavos.|Ao simular uma compra ou explicar quanto crédito pode ser usado. A compra precisa superar o valor indicado na faixa.
business.agent_name|Nome usado na saudação alternativa|Nome inserido em {agent_name} quando a saudação precisa usar o nome padrão por falta de perfil ativo.|Na escolha da mensagem inicial de atendimento.
business.greeting_variants|Variações de saudação|Lista de mensagens de abertura disponíveis. A variável {agent_name} recebe o nome do agente.|Quando chega uma saudação e a política de abertura escolhe uma variante.
business.institutional_knowledge|Conhecimento institucional|Reúne informações oficiais da loja por assunto. Os termos de busca ajudam a localizar o texto relevante; a política opcional condiciona seu uso.|Quando a pergunta combina com os termos de um assunto, como garantia, permuta, endereço ou entrega.
`);
section('Resposta e histórico', 'Ao preparar o contexto e a resposta de uma nova mensagem.', `
maxReplyChars|Tamanho máximo da resposta|Limita os caracteres do texto enviado ao cliente. Um limite menor torna as respostas mais curtas.
historyTurns|Mensagens consideradas no histórico|Define quantas mensagens recentes entram no contexto do modelo, respeitando os demais limites de histórico.
agent_max_recent_turns|Limite de mensagens recentes|Restringe a janela recente usada para compreender a conversa, em conjunto com o limite de histórico.
agent_history_hard_cap|Teto absoluto do histórico|Impõe o máximo de mensagens recuperadas, mesmo quando outra configuração pedir uma janela maior.
checkoutContextMaxAgeSeconds|Validade do contexto de compra (segundos)|Define por quanto tempo dados de uma intenção de compra podem ser retomados antes de exigir nova confirmação.|Ao retomar um checkout ou continuar uma compra interrompida.
browseContextMaxAgeSeconds|Validade da busca anterior (segundos)|Define por quanto tempo preferências e resultados de uma busca continuam atuais.|Quando o cliente retoma a conversa ou muda o assunto da busca.
conversationRepairPhrases|Frases que sinalizam falha na conversa|Lista de expressões que indicam repetição ou falta de compreensão e acionam a recuperação do atendimento.|Quando a mensagem do cliente contém um sinal de insatisfação ou repetição cadastrado.
conversationRepairHandoffAfter|Falhas antes de encaminhar à equipe|Quantidade de tentativas de recuperação que leva ao encaminhamento humano.|Quando as tentativas de entender o pedido continuam falhando.
`);
section('Modelos e geração de texto', 'Quando o agente chama o modelo para interpretar, planejar ou responder.', `
openai_model|Modelo padrão|Modelo usado quando o fluxo não escolhe um modelo especializado.
openai_main_model|Modelo principal|Modelo das tarefas de maior complexidade, como raciocínio e resposta comercial.
openai_fast_model|Modelo rápido|Modelo das tarefas menores, para reduzir o tempo de processamento.
openai_reasoning_effort|Esforço de raciocínio|Controla o nível de esforço solicitado ao modelo quando ele oferece esse recurso.
openai_text_verbosity|Detalhamento do texto|Solicita respostas mais concisas ou mais detalhadas ao modelo compatível.
openai_timeout_seconds|Tempo máximo de uma chamada (segundos)|Tempo que o cliente de IA aguarda antes de tratar uma chamada como expirada.
openai_max_retries|Novas tentativas após falha|Limita quantas vezes o cliente de IA pode repetir uma chamada que falhou.
openai_api_mode|Modo da API de IA|Seleciona a interface de geração usada pelo agente, conforme as regras de liberação.
openai_store_responses|Armazenar respostas no provedor|Controla a opção de armazenamento enviada à API de respostas.
openai_responses_structured_enabled|Saída estruturada|Permite solicitar respostas em formato estruturado nos fluxos que exigem dados organizados.
openai_responses_tool_loop_enabled|Ciclo de ferramentas|Permite continuar a geração após o modelo pedir uma consulta ou ferramenta.
openai_responses_fallback_to_chat|Alternativa após falha na API|Permite tentar a interface alternativa de geração se a API de respostas falhar.
openai_chat_completions_primary_allowed|Permitir interface alternativa como principal|Autoriza a interface Chat Completions como primeira opção nas regras de roteamento.
agent_llm_budget_enabled|Limitar chamadas de IA por mensagem|Ativa o controle do número de chamadas ao modelo durante o processamento de uma mensagem.
agent_max_llm_calls_per_turn|Chamadas por mensagem comum|Teto de chamadas de IA permitido para uma mensagem sem complexidade adicional.
agent_max_llm_calls_per_turn_complex|Chamadas por mensagem complexa|Teto usado em mensagens que precisam de consultas ou verificações adicionais.
`);
section('Memória e conhecimento', 'Ao recuperar informações anteriores e compor o contexto da próxima resposta.', `
agent_max_active_contact_memories|Memórias recuperadas por contato|Máximo de memórias do contato selecionadas para o atendimento.
agent_max_contact_memory_chars|Caracteres das memórias no contexto|Limita o espaço ocupado pelas memórias do contato na orientação enviada ao modelo.
agent_max_instruction_extensions|Instruções aprendidas no contexto|Máximo de instruções adicionais selecionadas para orientar a resposta.
agent_persona_knowledge_in_prompt_enabled|Incluir conhecimento cadastrado|Permite acrescentar ao contexto trechos relevantes do conhecimento vinculado ao agente.
agent_max_persona_knowledge_chars|Caracteres de conhecimento no contexto|Limita o tamanho total dos trechos de conhecimento incluídos.
agent_max_conversation_summary_chars|Tamanho máximo do resumo|Limita os caracteres usados no resumo persistido da conversa.|Ao gerar ou atualizar o resumo da conversa.
agent_memory_proposals_enabled|Propor novas memórias|Permite extrair informações da conversa como propostas de memória.|Após processar uma mensagem que contém informações úteis sobre o contato.
agent_memory_auto_apply_enabled|Aplicar memórias automaticamente|Permite ativar propostas de memória que atendem aos critérios de confiança e importância.|Na análise de uma proposta de memória.
agent_memory_auto_apply_min_confidence|Confiança mínima para aplicar memória|Exige uma pontuação mínima de certeza antes da aplicação automática de uma memória.|Quando a aplicação automática de memória está habilitada.
agent_memory_auto_apply_min_importance|Importância mínima para aplicar memória|Exige uma pontuação mínima de utilidade da informação para o atendimento.|Quando a aplicação automática de memória está habilitada.
agent_contact_memory_in_prompt_enabled|Usar memória do contato na resposta|Inclui as memórias aprovadas do contato na orientação ao modelo.
agent_contact_preference_memory_enabled|Guardar preferências do contato|Permite persistir preferências como marca, estilo ou faixa de preço.|Ao identificar preferências nas mensagens do cliente.
agent_contact_preference_summary_enabled|Resumir preferências|Permite criar um resumo das preferências persistidas do contato.|Ao consolidar as preferências detectadas no atendimento.
agent_contact_preference_rehydrate_enabled|Recuperar preferências ao retornar|Permite restaurar preferências anteriores ao retomar uma conversa.
agent_contact_preference_ttl_days|Validade das preferências (dias)|Define por quanto tempo preferências guardadas podem ser reutilizadas.
agent_contact_theme_ttl_days|Validade do assunto anterior (dias)|Define por quanto tempo o tema de interesse do contato pode ser retomado.
agent_contact_preference_min_confidence|Confiança mínima das preferências|Filtra preferências pouco certas antes de guardá-las ou reutilizá-las.
agent_instruction_extension_proposals_enabled|Propor instruções de melhoria|Permite sugerir orientações adicionais com base nos atendimentos.|Ao extrair aprendizados depois de uma resposta.
agent_conversation_summary_enabled|Gerar resumo da conversa|Permite atualizar um resumo do que já aconteceu no atendimento.|Após processar mensagens, conforme o modo de resumo.
agent_conversation_summary_in_prompt_enabled|Usar resumo na resposta|Inclui o resumo da conversa no contexto enviado ao modelo.
agent_conversation_summary_mode|Modo de elaboração do resumo|Seleciona como o resumo é produzido e usado pelo serviço de memória.
agent_max_learned_cases|Exemplos aprendidos no contexto|Máximo de exemplos de atendimentos anteriores usados para orientar a resposta.
agent_max_learned_case_chars|Tamanho dos exemplos aprendidos|Limita os caracteres dos exemplos de aprendizado incluídos no contexto.
agent_knowledge_attachment_limit|Anexos consultados na busca|Máximo de documentos que participam da busca por conhecimento relevante.
agent_knowledge_chunk_chars|Tamanho de cada trecho de documento|Divide documentos em trechos deste tamanho para localizar conteúdo relevante.
agent_knowledge_max_chunks|Trechos de conhecimento selecionados|Limita quantos trechos encontrados são devolvidos ao agente.
agent_knowledge_relative_score|Relevância mínima dos trechos|Seleciona trechos com pontuação suficiente em relação ao melhor resultado da busca.
`);
section('Qualidade e decisões', 'Durante a interpretação do pedido e a revisão da resposta antes do envio.', `
agent_turn_understanding_enabled|Interpretar a intenção da mensagem|Ativa o entendimento estruturado do pedido nas regras de liberação do agente.
agent_policy_mode|Modo das regras de atendimento|Define como as políticas operacionais participam da validação da resposta.
agent_tool_policy_mode|Modo de autorização das ferramentas|Define como o agente valida se uma consulta ou ação é permitida.
agent_factual_validation_mode|Validação de informações|Define como fatos apresentados na resposta são conferidos antes do envio.
agent_trusted_fact_domains|Fontes confiáveis de informação|Lista os domínios aceitos na validação de fatos e links comerciais.
agent_presenter_mode|Modo de apresentação da resposta|Seleciona a estratégia de montagem do texto final nas regras de liberação.
agent_quality_judge_mode|Modo de avaliação de qualidade|Define quando a avaliação adicional da resposta participa do fluxo.
agent_quality_judge_risk_threshold|Risco mínimo para avaliação adicional|Pontuação de risco que exige uma análise mais cuidadosa da resposta.
agent_quality_judge_sample_rate|Proporção de respostas avaliadas|Define a fração de respostas selecionada para a avaliação de qualidade.
agent_answer_council_enabled|Revisão coordenada da resposta|Ativa a etapa que confere decisões e resolve inconsistências antes de responder.
agent_answer_council_max_restarts|Tentativas de reconstrução da resposta|Limita quantas vezes a revisão pode reiniciar a montagem de uma resposta.
agent_critique_mode|Modo de revisão crítica|Escolhe o funcionamento da revisão crítica, de observação a correção, conforme a opção cadastrada.
agent_critique_enforce_on_commerce|Exigir revisão nas respostas comerciais|Exige a revisão dos textos que envolvem produtos, preços ou compras.
agent_critique_max_retries|Tentativas após uma crítica|Limita as regenerações de resposta quando a revisão identifica um problema.
agent_critique_llm_on_risk_only|Chamar revisor apenas em caso de risco|Restringe o uso de IA na revisão às respostas que apresentam risco.
agent_critique_shadow_sample_rate|Amostra da revisão em observação|Fração das respostas revisada para comparação enquanto a revisão opera em observação.
agent_double_check_mode|Modo de segunda conferência|Controla a conferência adicional de uma resposta antes de continuar o envio.
`);
section('Aprendizado e reversão', 'Nos ciclos de análise dos atendimentos e na avaliação de instruções aprendidas.', `
learningEnabled|Revisar atendimentos|Permite que o ciclo de aprendizado analise respostas e proponha melhorias.
learningAutoPromote|Criar instruções de melhoria|Transforma insights aprovados pelas regras de aprendizado em instruções pendentes.
learningAutoActivate|Ativar melhorias automaticamente|Permite que uma instrução elegível entre em uso sem ativação manual.
learningLookbackHours|Janela de análise (horas)|Período de atendimentos recentes considerado pelo ciclo de aprendizado.
learningBatchLimit|Respostas analisadas por ciclo|Máximo de respostas processadas em uma execução do aprendizado.
learningMaxClusters|Grupos de problemas por ciclo|Limita os conjuntos de falhas enviados para reflexão em cada execução.
learningCanaryHours|Período de observação (horas)|Tempo durante o qual uma nova instrução é acompanhada antes da avaliação final.
learningRollbackMinReviews|Avaliações mínimas para decidir|Amostra mínima necessária para confirmar ou reverter uma instrução em observação.
learningRollbackFailLift|Piora relativa que causa reversão|Multiplicador da taxa anterior de falhas que indica deterioração de qualidade.
agent_learning_bootstrap_hours|Histórico inicial do aprendizado (horas)|Janela usada para iniciar o aprendizado quando ainda não há progresso anterior.
agent_learning_reflect_enabled|Refletir sobre as falhas|Permite usar IA para transformar grupos de falhas em uma orientação de melhoria.
agent_learning_max_instruction_chars|Tamanho das instruções aprendidas|Limita os caracteres de uma instrução proposta durante sua validação.
agent_learning_rollback_abs_fail|Taxa absoluta de falhas para reversão|Limite de falhas que pode reprovar uma instrução independentemente da piora relativa.
`);
section('Busca e seleção de produtos', 'Quando o cliente pede um produto, preço, alternativa ou recomendação.', `
catalogShortlistSize|Produtos revalidados na seleção|Limita os produtos finalistas cujos dados são reconferidos antes da apresentação.
catalogCandidatePool|Produtos candidatos à busca|Máximo de produtos avaliados antes de selecionar os melhores resultados.
catalogRerankLimit|Produtos na seleção final|Limita os candidatos enviados à etapa que reordena os resultados por relevância.
agent_catalog_index_read_enabled|Consultar índice de produtos|Permite usar a cópia indexada do catálogo para localizar produtos.
agent_catalog_index_write_enabled|Atualizar índice durante consultas|Permite registrar produtos consultados no índice para reutilização posterior.
agent_catalog_index_fallback_to_tray|Consultar a loja se o índice não bastar|Permite recorrer à consulta ao catálogo da loja quando o índice não resolve a busca.
agent_catalog_index_max_age_seconds|Idade máxima dos dados do índice (segundos)|Define quando os dados indexados deixam de ser considerados suficientemente recentes.
agent_catalog_index_candidate_limit|Candidatos recuperados do índice|Limita quantos produtos o índice fornece para a busca.
agent_catalog_exact_search_call_limit|Consultas para um modelo específico|Teto de consultas ao catálogo ao procurar uma referência ou modelo exato.
agent_catalog_recommendation_search_call_limit|Consultas para recomendações|Teto de consultas ao catálogo ao procurar opções por preferências.
agent_catalog_similarity_threshold|Semelhança mínima na busca textual|Pontuação mínima para aceitar correspondências aproximadas entre o pedido e o nome do produto.
agent_catalog_trgm_retry_seconds|Intervalo antes de repetir busca aproximada|Espera, em segundos, antes de tentar novamente o recurso de semelhança textual após uma falha.
`);
section('Atualização e cache de produtos', 'Ao reutilizar dados de produto ou executar a atualização periódica do catálogo.', `
agent_product_cache_enabled|Reutilizar consultas de produto|Permite guardar resultados recentes para evitar repetir a mesma consulta.
agent_product_cache_ttl_seconds|Validade dos dados do produto (segundos)|Tempo de reutilização dos dados gerais de um produto.
agent_price_cache_ttl_seconds|Validade dos preços (segundos)|Tempo de reutilização de um preço consultado antes de buscar uma atualização.
agent_stock_cache_ttl_seconds|Validade do estoque (segundos)|Tempo de reutilização de uma informação de disponibilidade.
agent_search_cache_ttl_seconds|Validade dos resultados de busca (segundos)|Tempo durante o qual uma consulta igual pode aproveitar resultados anteriores.
agent_catalog_cache_ttl_seconds|Validade das listas do catálogo (segundos)|Tempo de reutilização das listas de produtos por marca ou categoria.
agent_image_cache_ttl_seconds|Validade das imagens (segundos)|Tempo de reutilização dos dados de imagem de um produto.
catalogWarmBrands|Marcas atualizadas periodicamente|Lista de marcas que entram na rotina de atualização antecipada do índice.|Durante a execução agendada de atualização do catálogo.
catalogWarmBrandLimit|Marcas atualizadas por execução|Limita quantas marcas a atualização periódica processa de cada vez.|Durante a execução agendada de atualização do catálogo.
catalogWarmProductsPerBrand|Produtos atualizados por marca|Limita quantos produtos são importados por marca em uma execução.|Durante a execução agendada de atualização do catálogo.
catalogStaleDays|Dias para sinalizar catálogo antigo|Idade dos dados que dispara a sinalização de desatualização.|Durante a verificação periódica de atualização do catálogo.
tray_circuit_breaker_enabled|Suspender consultas após falhas repetidas|Ativa a proteção que interrompe temporariamente chamadas ao catálogo quando o serviço está falhando.
tray_circuit_failure_threshold|Falhas antes da suspensão|Quantidade de falhas que abre a pausa temporária das consultas ao catálogo.
tray_circuit_open_seconds|Duração da suspensão (segundos)|Tempo de espera antes de voltar a testar o serviço do catálogo.
`);
section('Áudio e imagens', 'Quando o cliente envia uma mídia ou solicita uma resposta em áudio.', `
audio_inbound_enabled|Receber e transcrever áudio|Permite converter o áudio recebido em texto para o agente entender o pedido.
audio_outbound_enabled|Responder com áudio|Permite gerar uma resposta de voz nos fluxos e canais que suportam áudio.
openai_transcribe_model|Modelo de transcrição|Modelo usado para transformar a fala do cliente em texto.
openai_tts_model|Modelo de geração de voz|Modelo usado para transformar o texto da resposta em áudio.
openai_tts_voice|Voz das respostas|Seleciona a voz usada na geração de áudio.
openai_tts_format|Formato do áudio gerado|Formato de arquivo solicitado ao gerar uma resposta de voz.
agent_image_search_enabled|Identificar produtos em fotos|Permite analisar a foto recebida para encontrar o produto no catálogo.
agent_image_search_model|Modelo de análise de fotos|Modelo usado para extrair marca, modelo e características visuais de uma imagem.
agent_image_search_min_confidence|Confiança mínima da identificação|Exige certeza mínima para aproveitar uma identificação de produto por foto.
agent_image_download_max_bytes|Tamanho máximo da foto (bytes)|Limita o tamanho de uma imagem baixada para análise.
agent_visual_search_enabled|Buscar produtos por semelhança visual|Permite comparar uma imagem com imagens indexadas do catálogo.
agent_product_image_index_enabled|Indexar imagens dos produtos|Permite preparar imagens de catálogo para consultas por semelhança visual.|Na rotina de construção ou atualização do índice de imagens.
agent_visual_embedding_model|Modelo de representação visual|Modelo que converte a imagem em dados comparáveis na busca visual.
agent_visual_top_k|Resultados da busca visual|Máximo de imagens semelhantes retornadas pela busca visual.
agent_visual_max_distance|Diferença visual máxima aceita|Maior distância admitida entre imagens. Valores menores exigem maior semelhança.
agent_product_image_index_batch_size|Imagens indexadas por lote|Quantidade de imagens processadas de cada vez na atualização do índice.|Durante a indexação de imagens de produtos.
`);
section('Compra e acompanhamento', 'Quando o cliente avança na compra, consulta um pagamento ou retoma um carrinho.', `
checkout_cep_lookup_enabled|Completar endereço pelo CEP|Permite consultar dados de endereço a partir do CEP informado.
pix_direct_enabled|Gerar PIX no chat|Permite oferecer PIX direto no atendimento quando o checkout e a integração autorizam essa modalidade.
pix_exp_min|Validade do PIX (minutos)|Tempo de expiração solicitado ao criar uma cobrança PIX.
order_tracking_audit_sample_ids|Pedidos usados na auditoria de rastreio|Identificadores de pedidos usados para conferir respostas que deveriam informar rastreamento.|Na rotina de auditoria de informações de rastreio.
remarketing_enabled|Retomar carrinhos pendentes|Habilita a rotina de acompanhamento de compras interrompidas.|Na execução da rotina de remarketing, para contatos elegíveis.
remarketing_touch_hours|Intervalos de retomada (horas)|Define após quanto tempo cada tentativa de acompanhamento pode ocorrer.|Na seleção de carrinhos elegíveis para retomada.
remarketing_meta_window_hours|Janela de contato no canal (horas)|Limita o período considerado pela rotina ao enviar acompanhamento pelo canal Meta.|Antes de enviar uma mensagem de retomada.
remarketing_batch_size|Contatos por lote de retomada|Máximo de contatos processados em uma execução do acompanhamento.|Na execução da rotina de remarketing.
`);
section('Fila e atendimento humano', 'Ao receber mensagens, processar a fila e verificar quem está atendendo.', `
agent_async_ingress_enabled|Processar mensagens em fila|Permite receber a mensagem e deixar seu processamento para o worker da fila.
agent_inbox_batch_size|Mensagens por lote|Máximo de itens retirados da fila em cada rodada de processamento.
agent_inbox_lease_seconds|Reserva de processamento (segundos)|Tempo durante o qual um item fica reservado para o processo que o está atendendo.
agent_queue_retry_base_seconds|Espera inicial após falha (segundos)|Intervalo inicial usado para reagendar um item da fila que falhou.
agent_queue_retry_max_seconds|Espera máxima após falhas (segundos)|Teto do intervalo crescente entre novas tentativas de processamento.
agent_conversation_lock_enabled|Evitar processamento simultâneo|Ativa o bloqueio por conversa para impedir que mensagens sejam processadas simultaneamente.
agent_conversation_lock_timeout_seconds|Espera pelo bloqueio (segundos)|Tempo limite para conseguir processar uma conversa que está ocupada.
agent_send_idempotency_enabled|Evitar envios repetidos|Ativa o controle de mensagens já enviadas para não repetir a resposta em novas tentativas.
human_takeover_idle_minutes|Inatividade do atendimento humano (minutos)|Intervalo usado para decidir se um atendimento humano inativo pode deixar de bloquear o agente.
human_takeover_stale_conversa_days|Idade de vínculos humanos antigos (dias)|Define quando registros antigos de atendimento humano são considerados desatualizados.
instagram_ingress_provider|Origem das mensagens do Instagram|Indica qual provedor de entrada deve processar as mensagens do Instagram.
`);
section('Reconhecimento de Stories', 'Quando chega uma resposta a Story ou uma mídia do Instagram elegível para análise.', `
instagram_story_recognition_enabled|Reconhecer produtos nos Stories|Ativa a interpretação das referências a Stories recebidas no atendimento.
instagram_story_payload_diagnostics|Registrar dados de diagnóstico dos Stories|Permite registrar detalhes técnicos do evento recebido para investigar falhas de reconhecimento.
instagram_story_media_storage_enabled|Guardar mídias dos Stories|Permite armazenar a mídia para que o agente consiga analisá-la.
instagram_story_media_max_bytes|Tamanho máximo da mídia (bytes)|Limite de tamanho de arquivo aceito ao obter a mídia de um Story.
instagram_story_media_timeout_seconds|Espera pela mídia (segundos)|Tempo máximo de download da mídia do Story.
instagram_story_media_retention_days|Retenção das mídias (dias)|Período após o qual a rotina de retenção pode remover mídias antigas.|Na limpeza periódica das mídias de Stories.
instagram_story_allowed_hosts|Origens permitidas para mídias|Hosts dos quais o serviço pode baixar a mídia do Story.
instagram_story_video_frame_analysis_enabled|Analisar quadros de vídeo|Permite extrair quadros de um vídeo para identificar produtos.
instagram_story_video_max_frames|Quadros analisados por vídeo|Máximo de imagens extraídas de um vídeo para reconhecimento.
instagram_story_vision_model|Modelo de análise de Story|Modelo usado para analisar a imagem ou quadros do Story.
instagram_story_analysis_detail|Detalhamento da análise visual|Nível de detalhe solicitado ao modelo durante a análise da mídia.
instagram_story_analysis_version|Versão da análise visual|Identifica a versão do processamento e diferencia resultados armazenados em cache.
instagram_story_visual_cache_enabled|Reutilizar análise de Story|Permite aproveitar uma análise já feita para a mesma mídia.
instagram_story_visual_cache_ttl_days|Validade da análise de Story (dias)|Tempo de reutilização do resultado de uma análise visual.
instagram_story_auto_match_min_confidence|Confiança para associação automática|Pontuação mínima para vincular automaticamente o Story a um produto.
instagram_story_exact_match_min_confidence|Confiança para referência exata|Pontuação mínima para aceitar uma correspondência por identidade exata do produto.
instagram_story_visual_match_min_confidence|Confiança para semelhança visual|Pontuação mínima para aceitar um produto encontrado pela imagem.
instagram_story_ambiguous_min_confidence|Confiança para sugerir candidatos|Pontuação mínima para considerar uma associação ainda ambígua, que pode exigir confirmação.
instagram_story_match_margin|Diferença entre os melhores candidatos|Margem exigida entre os resultados para distinguir uma associação segura de uma ambígua.
instagram_story_max_candidates|Candidatos por Story|Máximo de produtos considerados na associação da mídia.
instagram_story_admin_api_enabled|Painel de gestão de Stories|Permite o acesso às rotas administrativas do reconhecimento.|Ao acessar as ferramentas administrativas de Stories.
instagram_story_account_tenant_map|Vínculo entre conta e empresa|Relaciona contas de Instagram à empresa responsável pelo atendimento.|Ao resolver a empresa de uma mídia ou evento do Instagram.
instagram_story_storage_bucket|Local de armazenamento das mídias|Nome do espaço de arquivos usado para guardar mídias de Stories.
instagram_story_rollout_mode|Modo de liberação dos Stories|Define se o reconhecimento está em observação, teste ou uso efetivo, conforme as opções do catálogo.
instagram_story_canary_percent|Percentual do teste de Stories|Fração do tráfego elegível para a nova análise durante a liberação gradual.
instagram_story_real_payload_validated|Evento real de Story validado|Registra se o formato de um evento real já foi validado para a liberação do recurso.
`);
section('Liberação gradual', 'Ao escolher o fluxo de processamento e acompanhar a qualidade de uma versão.', `
openai_shadow_sample_rate|Amostra de comparação entre APIs|Proporção das chamadas usada para comparar a API alternativa em observação.
openai_responses_traffic_percent|Tráfego na API de respostas (%)|Percentual de atendimentos encaminhado à API de respostas no teste gradual.
openai_canary_sticky_routing|Manter o mesmo fluxo por conversa|Evita alternar o fluxo de uma mesma conversa durante um teste gradual.
agent_rollout_profile|Perfil de liberação|Conjunto de escolhas que define quais partes do novo fluxo estão em uso.
agent_emergency_rollback|Reversão de emergência|Ativa as regras de retorno ao fluxo previsto para contingência.
agent_rollout_alert_enabled|Alertas de qualidade da liberação|Permite gerar alertas quando os indicadores ultrapassam os limites cadastrados.
agent_rollout_alert_window|Janela dos indicadores|Quantidade de resultados recentes considerada no cálculo dos alertas.
agent_rollout_alert_min_samples|Amostra mínima para alertas|Número mínimo de resultados antes de avaliar a qualidade da liberação.
agent_rollout_fallback_alert_rate|Limite de uso de alternativa|Taxa de respostas que recorreram à alternativa acima da qual é gerado alerta.
agent_rollout_factual_alert_rate|Limite de falhas factuais|Taxa de problemas na validação dos fatos acima da qual é gerado alerta.
agent_rollout_handoff_alert_rate|Limite de encaminhamentos humanos|Taxa de transferências ao atendimento humano acima da qual é gerado alerta.
`);
section('Diagnóstico e processo', 'Na inicialização do serviço ou nos pontos de diagnóstico do processamento.', `
observabilityLevel|Detalhamento dos registros|Seleciona o volume de informações registrado para diagnosticar o atendimento.|Durante o registro das etapas de processamento.
agent_full_obs_logs|Registros completos de execução|Amplia o detalhamento dos registros das etapas do agente.|Durante o registro das etapas de processamento.
agent_http_obs_logs|Registrar requisições HTTP|Habilita os registros de requisições tratados pela aplicação.|Na configuração do serviço HTTP; pode depender de reinicialização do processo.
agent_prompt_compilation_audit_enabled|Auditar a preparação do contexto|Registra como o contexto do agente foi composto para permitir investigação.|Ao compilar o contexto antes de chamar o modelo.
agent_debug_store_compiled_prompt|Guardar contexto completo para diagnóstico|Permite persistir o texto compilado usado para orientar o modelo.|Ao registrar a compilação do contexto.
agent_legacy_prompt_compat_enabled|Compatibilidade do contexto antigo|Permite incluir componentes do contexto legado na montagem da orientação ao modelo.|Ao compilar o contexto da resposta.
agent_runtime_enabled|Habilitar o processo do agente|Controla a ativação do runtime na inicialização da aplicação.|Na inicialização do processo; publicar o campo não reinicia o serviço.
app_name|Nome técnico da aplicação|Identificação do serviço exibida na sua verificação de funcionamento.|Nas respostas de diagnóstico de saúde do serviço.
database_pool_enabled|Reutilizar conexões ao banco|Ativa o conjunto de conexões reutilizáveis do processo.|Ao inicializar ou obter conexões do processo; pode exigir reinicialização.
database_pool_max_size|Máximo de conexões reutilizáveis|Limita o tamanho do conjunto de conexões do processo ao banco.|Ao criar o conjunto de conexões do processo.
database_pool_timeout_seconds|Espera por conexão (segundos)|Tempo máximo de espera para obter uma conexão livre.|Quando o conjunto de conexões está ocupado.
`);
section('Compatibilidade', 'Não foi localizada uma leitura operacional deste campo no código atual. Mantido para compatibilidade; publicar não garante efeito no atendimento.', `
log_level|Nível técnico de log legado|Campo de nível de log presente no catálogo. O detalhamento operacional é controlado também pelos campos de observabilidade.
openai_agent_name|Nome técnico legado do agente|Nome técnico presente no catálogo. O nome da saudação e a persona têm campos próprios.
agent_max_instruction_extension_chars|Limite legado de caracteres de instrução|Limite cadastrado para extensões; seu uso não foi localizado no compilador atual.
agent_max_persona_attachments|Limite legado de anexos|Campo antigo. Use “Anexos consultados na busca” para controlar a seleção atual de documentos.
tray_ready_to_ship_category_ids|Categorias legadas de pronta entrega|Identificadores de categoria cadastrados; o consumo deste campo não foi localizado na busca atual.
`);

const messageFlows: Record<string, [string, string]> = {};
function flows(sectionName: string, rows: string) {
  for (const line of rows.trim().split('\n')) {
    const [key, label, when] = line.trim().split('|');
    messageFlows[key] = [label, when];
    flowSections[key] = sectionName;
  }
}
const flowSections: Record<string, string> = {};
flows('Compra, carrinho e pagamento', `
agents.commerce_order.try_commerce_confirmation|Confirmação de compra|Quando uma confirmação do cliente retoma uma ação comercial pendente.
commerce.cart_service._create_cart_items_checkout_impl|Criação de carrinho|Ao validar e incluir os itens selecionados no carrinho.
commerce.cart_service._reconciled_cart_result|Resultado do carrinho|Ao apresentar o carrinho depois de conferir os itens com a loja.
commerce.cart_service.current_cart_reply|Resumo do carrinho|Quando o cliente pede para consultar seu carrinho atual.
commerce.checkout_data_service.checkout_data_template|Dados necessários para comprar|Quando faltam dados cadastrais ou de entrega para prosseguir no checkout.
commerce.checkout_data_service.update_checkout_data|Atualização do cadastro da compra|Ao validar e salvar os dados de compra informados pelo cliente.
commerce.checkout_service.cart_pay_link_copy|Link para finalizar o carrinho|Ao apresentar o link oficial para concluir a compra.
commerce.checkout_service.checkout_channel_choice_prompt|Escolha da forma de finalizar|Quando é necessário escolher entre checkout pelo site e atendimento assistido.
commerce.checkout_service.select_checkout_channel|Forma de finalizar selecionada|Ao confirmar a modalidade de checkout escolhida pelo cliente.
commerce.payment_service._blocked_payment_advance|Pagamento bloqueado por dados pendentes|Quando faltam requisitos confirmados para avançar com o pagamento.
commerce.payment_service._no_cart|Compra sem carrinho|Quando é solicitado pagamento sem um carrinho disponível.
commerce.payment_service.inspect_current_cart|Consulta do carrinho|Ao consultar o estado atual do carrinho antes de prosseguir.
commerce.payment_service.inspect_order_payment|Situação do pagamento|Quando o cliente pede confirmação ou detalhes do pagamento de um pedido.
commerce.payment_service.inspect_payment_options|Opções de pagamento|Ao consultar as modalidades de pagamento disponíveis para a compra.
commerce.pix_checkout_service._pix_reply|Cobrança PIX disponível|Depois de obter os dados da cobrança, para apresentar o PIX ao cliente.
commerce.pix_checkout_service.generate_direct_pix_checkout|Geração de PIX no chat|Ao tentar criar uma cobrança PIX: pode apresentar o resultado ou informar dados pendentes e indisponibilidade.
commerce.pix_checkout_service.refresh_direct_pix_checkout|Atualização de PIX|Quando o cliente pede nova consulta, confirmação ou atualização da cobrança PIX.
sales.checkout_flow._combine_order_and_payment_results|Pedido e pagamento|Ao reunir a situação do pedido com o resultado da consulta ao pagamento.
sales.checkout_flow._pending_action_rejected_result|Ação cancelada pelo cliente|Quando o cliente recusa uma ação de compra que aguardava confirmação.
sales.purchase_selection._ask_which_option_repair|Confirmar produto escolhido|Quando o cliente quer comprar, mas a opção escolhida ainda não está clara.
sales_agent._purchase_close_hold_reply|Escolher antes de fechar|Quando é necessário confirmar o item antes de avançar na compra.
`);
flows('Pedidos e entrega', `
commerce.order_service._order_customer_mismatch_result|Pedido de outro cliente|Quando a identificação do pedido não corresponde ao cliente autenticado.
commerce.order_service._order_facts_result|Informações do pedido|Depois de consultar os dados confirmados de um pedido.
commerce.order_service._order_not_found_result|Pedido não localizado|Quando a consulta não encontra o pedido solicitado.
commerce.order_service.confirm_prepared_order|Confirmação de pedido preparado|Quando o cliente autoriza a criação de um pedido já preparado.
commerce.order_service.create_order|Criação de pedido|Ao tentar criar o pedido, incluindo sucesso, dados pendentes ou indisponibilidade.
commerce.order_service.find_order_by_customer_document|Localização por documento|Quando o pedido precisa ser localizado usando o documento do cliente.
commerce.order_service.get_order_facts|Consulta de pedido|Ao buscar situação e detalhes do pedido na integração da loja.
commerce.order_service.invalid_tax_document_result|Documento inválido|Quando o documento informado não passa pela validação.
commerce.order_service.order_notes_unavailable_result|Observação de pedido indisponível|Quando não é possível registrar ou consultar uma observação do pedido.
commerce.order_service.prepare_order|Preparação de pedido|Ao conferir requisitos e preparar o pedido antes da autorização final.
commerce.order_tracking_audit.fetch_recent_missing_tracking_reply_count|Auditoria de rastreamento|Na consulta interna que conta respostas recentes sem o rastreamento esperado.
commerce.shipping_service.list_shipping_methods|Modalidades de frete|Depois de consultar as formas de envio disponíveis.
commerce.shipping_service.quote_shipping|Cotação de frete|Ao consultar valor e prazo de entrega para os itens e o endereço informados.
commerce.shipping_service.select_shipping|Escolha de frete|Quando o cliente escolhe uma opção de envio e o agente a valida.
`);
flows('Produtos e recomendações', `
commerce.commerce_router._product_result|Apresentação de produto|Ao transformar uma consulta de produto em resposta para o cliente.
commerce.commerce_router.guided_near_match_result|Alternativas próximas|Quando o produto exato não foi confirmado e existem opções próximas para apresentar.
commerce.commerce_router.handle_commerce_message|Consulta comercial|Ao responder uma consulta comercial encaminhada às ferramentas da loja.
sales.answer_council._honest_constraint_reply|Busca sem resultado confirmado|Quando nenhum resultado confirmado satisfaz os critérios solicitados.
sales.answer_council._continue_prompt_result|Retomar a escolha de produto|Quando o cliente autoriza continuar, mas ainda faltam critérios para buscar.
sales.answer_council._continue_commerce_reply|Continuar a compra escolhida|Quando o cliente retoma uma opção apresentada e pode avançar na compra.
sales.catalog_media._dead_product_link_reply|Link de produto indisponível|Quando não foi possível obter um link válido do produto.
sales.catalog_media.try_catalog_media|Foto ou link do produto|Quando o cliente pede mídia ou link de um produto já citado.
sales.catalog_pending.apply_catalog_pending|Busca pendente|Quando a mensagem complementa uma busca que aguardava informação.
sales.catalog_purchase.try_catalog_purchase|Seleção para compra|Quando uma referência à lista precisa ser convertida nos itens do carrinho.
sales.catalog_reference.resolve_catalog_reference|Identificar produto citado|Quando é necessário resolver a referência a uma foto, modelo ou produto anterior.
sales.catalog_retrieve.retrieve_catalog_or_clarify|Buscar ou pedir mais informações|Quando faltam critérios para a consulta ou é necessário esclarecer o pedido.
sales.checkout_flow._inspect_listed_products|Reconsultar produtos apresentados|Quando o cliente pergunta sobre os modelos da lista anterior.
sales.discovery._city_or_urgency_prompt|Cidade e urgência de entrega|Quando a qualificação chega às informações de entrega ou urgência.
sales.discovery._is_fulfillment_persona_prompt|Identificação de pergunta sobre entrega|Ao reconhecer se uma pergunta de qualificação trata de entrega. Este texto funciona como termo de identificação.
sales.policies.action_authority.informational_payment_policy_result|Orientação sobre pagamento|Quando o cliente pergunta condições de pagamento, sem autorizar uma compra.
sales.policies.action_authority.purchase_product_required_result|Produto necessário para comprar|Quando o cliente pede compra ou preço sem um produto selecionado.
sales.policies.objection_authority._short_reply_for_kind|Resposta a objeções|Quando o agente identifica uma objeção e seleciona a orientação correspondente ao seu tipo.
sales.responder.generate_clarification_reply|Esclarecer preferências|Quando o agente precisa pedir critérios adicionais para entender o produto desejado.
sales.tray_query_authority._budget_miss_reply|Nenhum produto no orçamento|Quando a consulta não encontra produtos dentro da faixa informada.
sales.tray_query_authority.budget_hard_miss_result|Orçamento sem correspondência|Quando a busca confirma que os critérios de preço não foram atendidos.
sales.tray_query_authority.budget_miss_from_authorization|Critérios sem resultado autorizado|Quando a validação dos resultados impede apresentar uma opção como compatível.
`);
flows('Abertura e suporte', `
agents.door._non_handoff_fallback|Alternativa de continuidade|Quando o fluxo de entrada precisa continuar sem uma transferência humana confirmada.
agents.door._route_after_interpret|Resposta após interpretar o pedido|Depois de identificar a intenção, ao escolher a próxima etapa do atendimento.
agents.door.generate_openai_reply_async|Resposta do fluxo de entrada|Durante o processamento principal, nos casos tratados diretamente pela entrada do agente.
agents.door_media.try_media_routes|Tratamento de mídia recebida|Quando a entrada contém mídia e o agente tenta identificar uma rota de tratamento.
identity.greeting_policy.choose_farewell_reply|Despedida|Quando o cliente encerra a interação e a política seleciona uma despedida.
identity.greeting_policy.choose_greeting_reply|Saudação inicial|Quando a mensagem é uma saudação e a política escolhe a abertura apropriada.
identity.user_preferences.mark_preferred_name_prompted|Registro da pergunta sobre nome|Na persistência interna de que o cliente já foi perguntado sobre como prefere ser chamado.
business.human_support_message|Contato da equipe humana|Quando o atendimento precisa informar o WhatsApp oficial da equipe.
business.register_phone_message|Cadastro de telefone necessário|Quando não há telefone cadastrado para consultar os dados da conta.
business.third_party_refusal|Proteção de informações de terceiros|Quando há pedido para consultar dados de outra pessoa.
business.general_greeting_fallback|Saudação alternativa|Quando a abertura normal não produz uma saudação disponível.
business.greeting_reply|Saudação padrão|Quando a política de abertura usa o texto padrão de saudação.
business.store_lookup_unavailable|Consulta da loja indisponível|Quando ocorre uma falha ao consultar informações comerciais da loja.
business.store_knowledge_unavailable|Informação oficial ausente|Quando o agente não encontra uma informação oficial no conhecimento disponível.
`);
flows('Sorteios e Cartão Presente', `
llm.agent_replies._build_last_participation_reply|Última participação|Quando o cliente consulta sua participação mais recente em sorteio.
llm.agent_replies.build_available_numbers_reply|Números disponíveis|Quando o cliente consulta os números disponíveis em um sorteio.
llm.agent_replies.build_balance_reply|Saldo do cliente|Depois de consultar o saldo da conta vinculada ao atendimento.
llm.agent_replies.build_coupon_code_reply|Código do Cartão Presente|Ao apresentar o código e o saldo do Cartão Presente consultado.
llm.agent_replies.build_current_raffle_reply|Sorteio atual|Quando o cliente pede informações sobre o sorteio aberto.
llm.agent_replies.build_preferred_name_reply|Nome preferido confirmado|Quando o cliente informa como deseja ser chamado e o dado é registrado.
llm.agent_replies.build_raffle_history_reply|Histórico de participações|Quando o cliente consulta suas participações anteriores.
llm.agent_replies.build_simulation_reply|Solicitação de simulação|Quando o cliente quer simular o uso do Cartão Presente e o fluxo organiza a resposta.
ops.simulation.build_purchase_simulation_reply|Simulação de compra com crédito|Ao calcular o uso do crédito em uma compra segundo as faixas cadastradas.
business.format_card_usage_table_text|Tabela de uso do crédito|Ao apresentar as faixas de crédito e as condições de valor da compra.
business.build_rules_reply|Regras dos sorteios|Quando o cliente pede explicações sobre participação e Cartão Presente.
`);
flows('Instruções internas e alternativas', `
llm.capability_catalog.format_capability_catalog_for_prompt|Ferramentas disponíveis para a IA|Ao montar a orientação interna sobre consultas e ações disponíveis ao agente.
llm.prompt_compiler.compile_agent_prompt|Orientação base da resposta|Ao compilar as instruções que serão enviadas ao modelo antes da resposta.
persona.persona_admin_api.admin_prompt_preview|Prévia administrativa das instruções|Quando um administrador solicita uma prévia do contexto do agente.
persona.persona_repository.insert_prompt_compilation|Registro de compilação|Na consulta interna que grava uma auditoria de preparação do contexto.
persona.persona_runtime.prompt_policy_block|Regras operacionais no contexto|Ao compor o bloco de políticas que orienta o modelo durante o atendimento.
verify.response_critique._regenerate_reply|Instrução para corrigir resposta|Quando a revisão reprova o texto e solicita uma nova resposta com os fatos disponíveis.
business.build_site_knowledge_text|Conhecimento do site no contexto|Ao preparar a base oficial de regras da loja e dos sorteios para orientar o modelo.
business.persona_greeting_operational|Instrução de saudação|Quando o cliente envia apenas uma saudação e o modelo deve responder somente com a abertura.
business.system_instructions|Orientações gerais do agente|Ao preparar as instruções de sistema do fluxo de entrada.
instructions.sales_planner_instructions|Planejamento de consultas|Quando a IA precisa planejar as consultas comerciais necessárias para responder.
instructions._operator_sales_responder_instructions_1|Orientação da resposta comercial|Ao instruir o modelo a redigir uma resposta usando os fatos comerciais consultados.
instructions.sales_clarification_instructions|Orientação de qualificação|Quando o agente precisa entender as preferências antes de recomendar produtos.
instructions.out_of_scope_reply|Pedido fora do escopo|Quando a solicitação está fora dos assuntos atendidos pela loja.
instructions._operator_sales_interpreter_instructions_1|Interpretação do pedido|Ao orientar a IA a identificar a intenção e os dados da mensagem sem responder ao cliente.
instructions.checkout_flow_instructions|Orientação de checkout|Ao preparar as regras internas para decidir como avançar na compra pelo atendimento.
instructions.sales_interpreter_instructions|Composição das instruções de interpretação|Ao reunir os blocos que orientam a interpretação de uma mensagem comercial.
instructions.sales_responder_instructions|Composição das instruções de resposta|Ao reunir os blocos de orientação da resposta comercial.
instructions.audio_transcription_failed_reply|Falha na transcrição de áudio|Quando o áudio recebido não pôde ser convertido em texto.
instructions._whisper_brand_prompt|Vocabulário da transcrição|Ao orientar o modelo de transcrição sobre marcas e termos esperados nos áudios.
instructions._empty_reply_fallback|Resposta vazia|Quando o processamento não produziu texto para enviar ao cliente.
instructions.unviewable_media_guide_reply|Mídia do Instagram inacessível|Quando o provedor não entrega uma imagem utilizável para análise.
instructions.price_without_image_instagram_reply|Preço de imagem inacessível|Quando o cliente pergunta o preço de um produto em imagem do Instagram que o agente não conseguiu acessar.
instructions.commerce_unavailable|Serviço comercial indisponível|Quando não é possível consultar as informações da loja.
instructions.product_not_found_reply|Produto não encontrado|Quando a consulta não localiza o produto solicitado.
instructions.shipping_leadtime_guidance|Orientação de prazo de entrega|Quando o fluxo de frete precisa orientar sobre prazo e necessidade de modelo e CEP.
instructions.scope_send_fallback|Resultado ainda não confirmado|Quando a validação final impede enviar produtos sem confirmação adequada.
instructions.purchase_close_relist_fallback|Confirmar opção para fechamento|Quando o fechamento exige que o cliente indique uma opção da lista.
`);
section('Mensagens de operação', 'Quando o fluxo correspondente seleciona esta mensagem.', `
message.double_check_system|Instrução da segunda conferência|Orienta a IA revisora a conferir a resposta de forma independente, usando o pedido e os dados confirmados.|Na etapa de segunda conferência que usa IA; o texto orienta o revisor e não é enviado ao cliente.
message.double_check_insufficiency|Resposta após conferência insuficiente|Mensagem alternativa quando a segunda conferência não aprova a resposta e não há uma retomada segura disponível.|Quando a segunda conferência está em modo de correção e precisa substituir uma resposta reprovada.
message.conversation_repair_ack|Reconhecimento de falha de compreensão|Trecho que reconhece a dificuldade e antecede a nova tentativa de busca.|Quando o cliente sinaliza falha e o contexto já contém modelo, referência ou marca suficientes para refazer a consulta.
message.conversation_repair_handoff|Encaminhamento após falhas repetidas|Texto usado para encaminhar a conversa à equipe quando o agente não consegue resolver o pedido.|Quando o limite de tentativas de recuperação é alcançado ou a revisão exige ajuda humana.
message.conversation_repair_missing_context|Pedir contexto para corrigir atendimento|Texto que pede os dados necessários para recuperar um pedido que não foi compreendido.|Quando o cliente sinaliza falha, mas o histórico ainda não identifica o produto que deveria ser consultado.
message.trade_in_handoff|Permuta: encaminhamento à equipe|Texto que informa a possibilidade de permuta com avaliação humana.|Quando o cliente pede permuta e a loja aceita esse tipo de negociação.
message.trade_in_unavailable|Permuta não disponível|Texto que informa a indisponibilidade de permuta na política atual.|Quando o cliente pede permuta e a opção está desativada.
message.handoff_requested|Atendimento humano solicitado|Confirma ao cliente a solicitação de transferência.|Depois que o fluxo de encaminhamento confirma a solicitação de atendimento humano.
message.handoff_failed|Falha no encaminhamento humano|Informa que não foi possível confirmar a transferência.|Quando a solicitação de atendimento humano falha.
message.catalog_unavailable|Catálogo indisponível|Resposta usada quando a consulta ao catálogo não pode ser confirmada.|Quando uma busca necessária falha ou não está disponível.
message.checkout_site|Orientação de checkout pelo site|Apresenta o link para finalizar a compra. A variável {url} recebe o endereço da compra.|Quando a compra deve ser concluída no site oficial.
message.learning_reflection_system|Instrução para analisar falhas|Orienta a IA a criar uma melhoria operacional a partir de um grupo de falhas.|Na etapa de reflexão do ciclo de aprendizado; não é uma mensagem enviada ao cliente.
`);

export function getConfigurationGuidance(field: AgentConfigurationField): ConfigurationGuidance {
  if (help[field.key]) return help[field.key];
  if (field.target === 'message') {
    const flow = field.key.replace(/^message\./, '').replace(/\.[a-f0-9]{10}$/, '');
    const documented = messageFlows[flow];
    if (documented) {
      const technical = /insert_prompt|mark_preferred_name_prompted|fetch_recent_missing_tracking/.test(flow);
      const instruction = /instructions|prompt|regenerate|capability|knowledge_text|whisper/.test(flow);
      return {
        label: documented[0], section: flowSections[flow], whenUsed: documented[1],
        purpose: technical ? 'Comando interno configurado para esta operação de registro ou consulta. Seu conteúdo não é uma resposta ao cliente.'
          : instruction ? 'Orienta o processamento interno do agente nesta etapa. As variáveis recebem informações da conversa e das consultas; o texto pode compor uma instrução maior.'
            : 'Texto ou trecho de resposta disponível nesta etapa. O conteúdo abaixo corresponde à situação tratada por esta variante; as variáveis são preenchidas com os dados obtidos no atendimento.',
      };
    }
  }
  return { label: field.label, purpose: field.description,
    whenUsed: 'O catálogo ainda não informa o ponto de uso deste campo. Consulte a referência do campo antes de alterá-lo.', section: 'Outras configurações' };
}
