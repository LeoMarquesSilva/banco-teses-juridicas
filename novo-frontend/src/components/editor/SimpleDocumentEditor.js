// src/components/editor/DocumentEditor.js
import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import mammoth from 'mammoth';
import './SimpleDocumentEditor.css';
import AIResponseModal from '../AIResponseModal/AIResponseModal';
// Importar as funções de API
import { carregarTexto, salvarTexto } from '../../api';

function DocumentEditor({ initialContent = '', teses = [], onSave }) {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState('Novo Documento');
  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const fileInputRef = useRef(null);
  
  // Novos estados para IA
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAction, setAiAction] = useState('');
  
  // Novos estados para controle de salvamento
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  
  // Configurar o título automaticamente se houver teses
  useEffect(() => {
    if (teses.length > 0) {
      // Usar apenas o título da tese como título do documento
      setTitle(`${teses[0].titulo || 'Documento sem título'}`);
      
      // Carregar o texto da tese do servidor
      const loadTeseText = async () => {
        try {
          if (teses[0].id) {
            const textoCarregado = await carregarTexto(teses[0].id);
            if (textoCarregado && textoCarregado.trim() !== '') {
              // Se o texto foi carregado com sucesso, use-o
              setContent(textoCarregado);
            } else {
              // Caso contrário, use o conteúdo inicial preparado
              const initialContent = prepareContent();
              setContent(initialContent);
            }
          } else {
            // Se não houver ID, use o conteúdo inicial preparado
            const initialContent = prepareContent();
            setContent(initialContent);
          }
        } catch (error) {
          console.error('Erro ao carregar texto da tese:', error);
          // Em caso de erro, use o conteúdo inicial preparado
          const initialContent = prepareContent();
          setContent(initialContent);
        }
      };
      
      loadTeseText();
    }
  }, [teses]);

  // Função para salvar o texto da tese
  const saveTeseText = async () => {
    if (teses.length === 0 || !teses[0].id) {
      // Se não houver tese selecionada ou ID, não há o que salvar
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveStatus('Salvando...');
      
      // Obter o conteúdo atual do editor
      const editorContent = editorRef.current ? editorRef.current.getContent() : content;
      
      // Remover metadados antes de salvar
      const cleanContent = removeMetadata(editorContent);
      
      // Salvar o texto da tese
      await salvarTexto(teses[0].id, cleanContent);
      
      // Atualizar estado após salvar
      setSaveStatus('Salvo com sucesso!');
      setLastSaved(new Date());
      
      // Limpar a mensagem de status após alguns segundos
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar texto da tese:', error);
      setSaveStatus('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Função para auto-salvar a cada 30 segundos
  useEffect(() => {
    if (teses.length > 0 && teses[0].id && isEditorReady) {
      const autoSaveInterval = setInterval(() => {
        saveTeseText();
      }, 30000); // 30 segundos
      
      return () => clearInterval(autoSaveInterval);
    }
  }, [teses, isEditorReady]);

  // Função auxiliar para remover metadados de qualquer conteúdo HTML
  const removeMetadata = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remover elementos com classe tese-metadata
    const metadataElements = tempDiv.querySelectorAll('.tese-metadata');
    metadataElements.forEach(element => {
      element.parentNode.removeChild(element);
    });
    
    // Remover também divs que podem conter metadados
    const metadataDivs = tempDiv.querySelectorAll('div[class*="metadata"], div[class*="meta-data"]');
    metadataDivs.forEach(element => {
      element.parentNode.removeChild(element);
    });
    
    return tempDiv.innerHTML;
  };

  // Função para preservar espaçamentos e formatação
  const preserveFormatting = (html) => {
    if (!html) return '';
    
    // Primeiro remover metadados
    html = removeMetadata(html);
    
    // Adicionar container com fonte Times New Roman tamanho 12
    let processed = '<div style="font-family: \'Times New Roman\', Times, serif; font-size: 12pt;">' + html + '</div>';
    
    // Garantir que parágrafos tenham margem adequada, fonte correta e recuo de 5cm na primeira linha
    processed = processed.replace(/<p/g, '<p style="margin-bottom: 1.5em; text-align: justify; line-height: 1.5; font-family: \'Times New Roman\', Times, serif; font-size: 12pt; text-indent: 5cm !important;" class="paragraph-indent-5cm"');
    
    // Preservar quebras de linha
    processed = processed.replace(/\n/g, '<br />');
    
    // Garantir que títulos tenham espaçamento adequado e fonte correta (sem recuo)
    processed = processed.replace(/<h1/g, '<h1 style="margin-top: 2em; margin-bottom: 1em; font-size: 16pt; font-weight: bold; font-family: \'Times New Roman\', Times, serif; text-indent: 0 !important;"');
    processed = processed.replace(/<h2/g, '<h2 style="margin-top: 1.5em; margin-bottom: 0.8em; font-size: 14pt; font-weight: bold; font-family: \'Times New Roman\', Times, serif; text-indent: 0 !important;"');
    processed = processed.replace(/<h3/g, '<h3 style="margin-top: 1.2em; margin-bottom: 0.6em; font-size: 13pt; font-weight: bold; font-family: \'Times New Roman\', Times, serif; text-indent: 0 !important;"');
    
    // Melhorar formatação de tabelas e listas (sem recuo)
    processed = processed.replace(/<table/g, '<table style="border-collapse: collapse; width: 100%; margin-bottom: 1.5em; font-family: \'Times New Roman\', Times, serif; font-size: 12pt;"');
    processed = processed.replace(/<td/g, '<td style="border: 1px solid black; padding: 8pt; font-family: \'Times New Roman\', Times, serif; font-size: 12pt; text-indent: 0 !important;"');
    processed = processed.replace(/<th/g, '<th style="border: 1px solid black; padding: 8pt; background-color: #f2f2f2; font-family: \'Times New Roman\', Times, serif; font-size: 12pt; text-indent: 0 !important;"');
    processed = processed.replace(/<ul/g, '<ul style="margin-bottom: 1.5em; margin-left: 2em; font-family: \'Times New Roman\', Times, serif; font-size: 12pt;"');
    processed = processed.replace(/<ol/g, '<ol style="margin-bottom: 1.5em; margin-left: 2em; font-family: \'Times New Roman\', Times, serif; font-size: 12pt;"');
    processed = processed.replace(/<li/g, '<li style="margin-bottom: 0.5em; font-family: \'Times New Roman\', Times, serif; font-size: 12pt; text-indent: 0 !important;"');
    
    return processed;
  };
  
  // Função para preparar o conteúdo das teses - SEM METADADOS
  const prepareContent = () => {
    if (teses.length === 0) return initialContent || '';
    
    let newContent = '<div class="document-container" style="font-family: \'Times New Roman\', Times, serif; font-size: 12pt; line-height: 1.5;">';
    
    teses.forEach((tese, index) => {
      // Não adicionar título para a primeira tese, pois já está no título do documento
      if (index > 0) {
        newContent += `<h2 style="font-size: 16pt; font-weight: bold; margin-top: 24pt; margin-bottom: 12pt; text-align: center; font-family: 'Times New Roman', Times, serif; text-indent: 0 !important;">${tese.titulo || 'Tese sem título'}</h2>`;
      }
      
      // Adicionar texto da tese, se disponível - SEM METADADOS
      if (tese.texto && tese.texto.trim() !== "" && tese.texto !== "Texto não fornecido") {
        // Remover metadados do texto antes de processá-lo
        const cleanText = removeMetadata(tese.texto);
        // Preservar formatação e espaçamentos no texto limpo
        const processedText = preserveFormatting(cleanText);
        newContent += `<div class="tese-content" style="margin-bottom: 2em;">${processedText}</div>`;
      } else {
        newContent += '<p style="font-style: italic; color: #666; margin: 1em 0; font-family: \'Times New Roman\', Times, serif; font-size: 12pt; text-indent: 0 !important;">Texto da tese não disponível</p>';
      }
      
      // Adicionar separador se não for a última tese
      if (index < teses.length - 1) {
        newContent += '<hr style="border: none; height: 2px; background-color: #ccc; margin: 40px 0;" />';
      }
    });
    
    newContent += '</div>';
    return newContent;
  };
  
  // Quando o editor estiver pronto
  const handleEditorInit = (evt, editor) => {
    editorRef.current = editor;
    setIsEditorReady(true);
    
    // Se houver teses, adicione o conteúdo ao editor
    if (teses.length > 0) {
      const preparedContent = prepareContent();
      
      // Pequeno atraso para garantir que o editor está totalmente inicializado
      setTimeout(() => {
        editor.setContent(preparedContent);
      }, 100);
    }
    
    // Configurar o estilo padrão para parágrafos com recuo de 5cm na primeira linha
    editor.formatter.register('defaultParagraph', {
      block: 'p',
      attributes: { 
        'style': 'text-indent: 5cm !important; font-family: \'Times New Roman\', Times, serif; font-size: 12pt; text-align: justify; line-height: 1.5;',
        'class': 'paragraph-indent-5cm'
      }
    });
    
    // Aplicar formatação padrão a todos os parágrafos
    editor.on('SetContent', function() {
      editor.dom.setStyles(editor.dom.select('p:not(.no-indent)'), {
        'text-indent': '5cm',
        'font-family': '\'Times New Roman\', Times, serif',
        'font-size': '12pt',
        'text-align': 'justify',
        'line-height': '1.5'
      });
      
      // Adicionar classe para recuo
      editor.dom.select('p:not(.no-indent)').forEach(p => {
        editor.dom.addClass(p, 'paragraph-indent-5cm');
      });
    });
    
    // Adicionar botões de IA à barra de ferramentas
    editor.ui.registry.addButton('resumir', {
      text: 'Resumir com IA',
      tooltip: 'Resumir o texto selecionado usando IA',
      onAction: function() {
        handleAIAction('resumir');
      }
    });
    
    editor.ui.registry.addButton('revisar', {
      text: 'Revisar com IA',
      tooltip: 'Revisar o texto selecionado usando IA',
      onAction: function() {
        handleAIAction('revisar');
      }
    });
    
    editor.ui.registry.addButton('sugerir', {
      text: 'Sugestões da IA',
      tooltip: 'Obter sugestões de melhoria para o texto',
      onAction: function() {
        handleAIAction('sugerir');
      }
    });
    
    editor.ui.registry.addButton('formatar', {
      text: 'Formatar ABNT',
      tooltip: 'Formatar texto segundo normas ABNT',
      onAction: function() {
        handleAIAction('formatar');
      }
    });
    
    editor.ui.registry.addButton('citacao', {
      text: 'Gerar Citação',
      tooltip: 'Gerar citação ABNT para o texto selecionado',
      onAction: function() {
        handleAIAction('citacao');
      }
    });
  };
  
  const handleEditorChange = (newContent) => {
    setContent(newContent);
  };

// Função para lidar com ações de IA
const handleAIAction = async (actionType) => {
  if (!editorRef.current) {
    alert("Editor não está pronto. Tente novamente.");
    return;
  }
  
  // Obter o conteúdo selecionado ou todo o conteúdo se nada estiver selecionado
  const selection = editorRef.current.selection.getContent();
  const content = selection || editorRef.current.getContent();
  
  // Remover tags HTML para enviar apenas o texto para a IA
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const textContent = tempDiv.textContent || tempDiv.innerText || "";
  
  if (textContent.trim().length < 10) {
    alert("Selecione um texto maior para processar com a IA.");
    return;
  }
  
  // Definir o prompt baseado no tipo de ação
  let prompt = "";
  setAiAction(actionType);
  
  switch (actionType) {
    case 'resumir':
      prompt = `Atue como um especialista em redação acadêmica e jurídica. 
      
Resumir o seguinte texto acadêmico/jurídico em português, observando estas diretrizes:

1. Mantenha todos os pontos principais e argumentos centrais
2. Preserve a terminologia técnica e jurídica essencial
3. Reduza o texto em aproximadamente 40-50% do tamanho original
4. Mantenha a estrutura lógica e a sequência argumentativa
5. Preserve citações importantes e referências a leis/jurisprudência
6. Mantenha o mesmo tom formal e acadêmico do texto original
7. Não adicione informações ou interpretações que não estejam no texto original
8. Organize o resumo em parágrafos coerentes, mantendo a fluidez do texto

Texto a ser resumido:
${textContent}`;
      break;
      
    case 'revisar':
      prompt = `Atue como um revisor especializado em textos acadêmicos e jurídicos.
      
Revise o seguinte texto em português, seguindo estas diretrizes específicas:

1. Corrija erros gramaticais, ortográficos e de pontuação
2. Melhore a clareza e coesão textual, eliminando ambiguidades
3. Garanta consistência terminológica ao longo do texto
4. Ajuste a estrutura de parágrafos e frases para melhor fluidez
5. Verifique o uso correto de termos técnicos e jurídicos
6. Mantenha o estilo formal e acadêmico
7. Não altere significativamente o conteúdo ou argumentos apresentados
8. Identifique e corrija problemas de concordância verbal e nominal
9. Elimine redundâncias e repetições desnecessárias
10. Preserve as citações e referências, apenas corrigindo sua formatação se necessário

Apresente o texto revisado completo, mantendo sua estrutura original.

Texto a ser revisado:
${textContent}`;
      break;
      
    case 'sugerir':
      prompt = `Atue como um consultor acadêmico especializado em textos jurídicos e acadêmicos.
      
Analise o seguinte texto em português e forneça sugestões detalhadas para melhorá-lo, considerando:

1. ESTRUTURA E ORGANIZAÇÃO:
   - Avalie a estrutura lógica e sequência argumentativa
   - Sugira reorganização de parágrafos ou seções se necessário
   - Identifique se há introdução, desenvolvimento e conclusão adequados

2. ARGUMENTAÇÃO E CONTEÚDO:
   - Identifique pontos onde os argumentos podem ser fortalecidos
   - Sugira adições de exemplos ou evidências onde apropriado
   - Aponte lacunas na argumentação ou no embasamento teórico

3. LINGUAGEM E ESTILO:
   - Sugira melhorias no vocabulário e terminologia técnica
   - Identifique trechos onde a clareza pode ser aprimorada
   - Recomende ajustes no tom e formalidade se necessário

4. ASPECTOS TÉCNICOS:
   - Verifique a precisão das referências a leis, doutrinas ou jurisprudência
   - Sugira melhorias na citação de fontes
   - Identifique possíveis inconsistências conceituais

5. IMPACTO ACADÊMICO:
   - Recomende formas de aumentar o rigor acadêmico
   - Sugira como tornar o texto mais persuasivo e impactante
   - Identifique oportunidades para demonstrar maior domínio do tema

Forneça suas sugestões de forma organizada, específica e construtiva, indicando claramente as seções ou parágrafos a que se referem.

Texto a ser analisado:
${textContent}`;
      break;
      
    case 'formatar':
      prompt = `Atue como um especialista em normas ABNT para documentos acadêmicos e jurídicos.
      
Reformate o seguinte texto acadêmico/jurídico seguindo rigorosamente as normas ABNT atuais, considerando:

1. FORMATAÇÃO GERAL:
   - Fonte Times New Roman ou Arial, tamanho 12 para corpo do texto
   - Espaçamento entre linhas de 1,5
   - Recuo de 1,25 cm na primeira linha de cada parágrafo
   - Margens: superior e esquerda de 3 cm; inferior e direita de 2 cm

2. ESTRUTURA DO TEXTO:
   - Organização em introdução, desenvolvimento e conclusão
   - Títulos e subtítulos hierarquicamente formatados
   - Numeração progressiva para as seções do texto

3. CITAÇÕES:
   - Citações diretas curtas (até 3 linhas) entre aspas duplas
   - Citações diretas longas (mais de 3 linhas) com recuo de 4 cm, fonte tamanho 10 e espaçamento simples
   - Citações indiretas devidamente indicadas com autor e ano

4. REFERÊNCIAS:
   - Formatação correta das referências bibliográficas
   - Alinhamento à esquerda
   - Ordenação alfabética

5. ELEMENTOS ESPECÍFICOS:
   - Formatação adequada de tabelas, figuras e quadros (se houver)
   - Numeração de páginas no canto superior direito
   - Sumário, resumo, abstract, palavras-chave (quando aplicável)

Mantenha o conteúdo original, apenas ajustando sua estrutura, formatação e elementos conforme as normas ABNT. Indique claramente as alterações realizadas e forneça orientações para elementos que não possam ser diretamente formatados no texto.

Texto a ser formatado:
${textContent}`;
      break;
      
    case 'citacao':
      prompt = `Atue como um especialista em normas ABNT para citações e referências bibliográficas.
      
Analise o seguinte texto acadêmico/jurídico e:

1. Identifique todas as obras, autores, leis, jurisprudências ou fontes mencionadas
2. Gere as citações e referências completas no formato ABNT para cada fonte identificada
3. Se o texto contiver informações incompletas sobre as fontes, indique quais dados estão faltando
4. Forneça exemplos de como as citações devem aparecer no corpo do texto (citação direta e indireta)
5. Organize as referências em ordem alfabética
6. Para leis e jurisprudência, siga as normas específicas da ABNT para documentos jurídicos
7. Se não houver informações suficientes para criar referências completas, forneça modelos de como elas deveriam ser estruturadas

Apresente seu resultado em duas seções:
A) CITAÇÕES NO TEXTO: Como as fontes devem ser citadas no corpo do texto
B) REFERÊNCIAS: Lista completa de referências no formato ABNT

Texto a ser analisado:
${textContent}`;
      break;
      
    default:
      prompt = `Atue como um especialista acadêmico com conhecimento em direito e redação científica.
      
Analise o seguinte texto acadêmico/jurídico em português de forma abrangente, considerando:

1. Qualidade da argumentação e fundamentação teórica
2. Clareza e coesão textual
3. Adequação da linguagem técnica e jurídica
4. Estrutura lógica e organização do conteúdo
5. Conformidade com normas acadêmicas
6. Precisão conceitual e terminológica
7. Potenciais melhorias em termos de conteúdo e forma

Forneça uma análise detalhada com recomendações específicas para aprimorar o texto, mantendo seu propósito e essência originais.

Texto a ser analisado:
${textContent}`;
  }
  
  setIsAIProcessing(true);
  setShowAIModal(true);
  
  try {
    // Chamar a API do n8n
    const response = await fetch('https://ia-n8n.a8fvaf.easypanel.host/webhook/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        userId: localStorage.getItem('userId') || 'anonymous'
      })
    });
    
    const data = await response.json();
    
    if (data && (data.success || data.response)) {
      setAiResult(data.response || data.output || data.result || data.text || JSON.stringify(data));
    } else {
      console.error("Resposta da IA:", data);
      alert(`Erro ao processar com IA: ${data?.message || 'Erro desconhecido'}`);
      setShowAIModal(false);
    }
  } catch (error) {
    console.error('Erro ao comunicar com a IA:', error);
    alert('Erro ao comunicar com o serviço de IA. Por favor, tente novamente.');
    setShowAIModal(false);
  } finally {
    setIsAIProcessing(false);
  }
};

  
  // Função para aplicar o resultado da IA ao texto
  const applyAIResult = (editedText) => {
  if (!editorRef.current || !editedText) return;
  
  // Formatar o resultado da IA para preservar parágrafos
  let formattedResult = editedText;
  
  // Para citações, não aplicamos formatação especial
  if (aiAction !== 'citacao' && aiAction !== 'sugerir') {
    // Converter quebras de linha em tags de parágrafo
    formattedResult = '<p class="paragraph-indent-5cm">' + 
      editedText.replace(/\n\n+/g, '</p><p class="paragraph-indent-5cm">') + 
      '</p>';
    
    // Remover parágrafos vazios
    formattedResult = formattedResult.replace(/<p class="paragraph-indent-5cm"><\/p>/g, '');
  } else if (aiAction === 'citacao') {
    // Para citações, colocamos em um formato especial
    formattedResult = '<p class="no-indent" style="margin: 1em 0; padding: 1em; background-color: #f8f9fa; border-left: 4px solid #3498db; font-style: italic;">' + 
      editedText.replace(/\n/g, '<br>') + 
      '</p>';
  } else if (aiAction === 'sugerir') {
    // Para sugestões, formatamos como uma lista
    formattedResult = '<div class="no-indent" style="margin: 1em 0; padding: 1em; background-color: #f8f9fa; border-left: 4px solid #9b59b6;">' + 
      editedText.replace(/\n\n+/g, '</p><p class="no-indent">').replace(/\n/g, '<br>') + 
      '</div>';
  }
  
  // Se houver seleção, substitui apenas o texto selecionado
  const selection = editorRef.current.selection.getContent();
  if (selection && aiAction !== 'sugerir' && aiAction !== 'citacao') {
    editorRef.current.selection.setContent(formattedResult);
  } else if (aiAction === 'sugerir' || aiAction === 'citacao') {
    // Para sugestões ou citações, inserimos após a seleção ou no final
    const currentPos = editorRef.current.selection.getNode();
    editorRef.current.selection.select(currentPos);
    editorRef.current.selection.collapse(false); // Colapsar para o final da seleção
    editorRef.current.insertContent(formattedResult);
  } else {
    // Caso contrário, substitui todo o conteúdo
    editorRef.current.setContent(formattedResult);
  }
  
  // Não precisamos mais fechar o modal aqui, pois o componente AIResponseModal já faz isso
  // quando o usuário clica em "Aplicar ao Texto"
};

  // Função para criar um documento RTF com recuo de primeira linha de 5cm
  const createRTFDocument = () => {
    // Obter o conteúdo atual do editor
    const editorContent = editorRef.current ? editorRef.current.getContent() : content;
    
    // Remover metadados antes de processar
    const cleanContent = removeMetadata(editorContent);
    
    // Criar um elemento DOM temporário para manipular o HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanContent;
    
    // Obter o texto limpo
    let plainText = '';
    
    // Adicionar título
    plainText += title + '\n\n';
    
    // Processar parágrafos com recuo
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      // Pular parágrafos vazios
      if (p.textContent.trim() === '') return;
      
      // Verificar se não é um parágrafo especial que não deve ter recuo
      const isSpecialParagraph = p.classList.contains('no-indent') || 
                                p.closest('table') || 
                                p.closest('li');
      
      // Adicionar recuo de primeira linha para parágrafos normais
      if (!isSpecialParagraph) {
        plainText += '     ' + p.textContent.trim() + '\n\n'; // 5 espaços para simular recuo
      } else {
        plainText += p.textContent.trim() + '\n\n';
      }
    });
    
    // Cabeçalho RTF básico com configuração de recuo de primeira linha
    const rtfHeader = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1046
{\\fonttbl{\\f0\\froman\\fprq2\\fcharset0 Times New Roman;}}
{\\*\\generator Microsoft Word 11.0.0000;}
{\\info{\\title ${title}}}
\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1
\\f0\\fs24\\lang1046
`;
    
    // Configuração de parágrafo com recuo de primeira linha de 5cm (aproximadamente 2500 twips)
    const paragraphFormat = '\\fi2500\\sa200\\sl276\\slmult1\\qj ';
    
    // Processar o conteúdo para RTF
    let rtfContent = '';
    const lines = plainText.split('\n');
    lines.forEach(line => {
      if (line.trim() === '') {
        rtfContent += '\\par\n';
      } else if (line.startsWith('     ')) { // Linhas com recuo
        rtfContent += paragraphFormat + line.trim() + '\\par\n';
      } else { // Linhas sem recuo (títulos, etc.)
        rtfContent += '\\fi0\\sa200\\sl276\\slmult1\\qc ' + line.trim() + '\\par\n';
      }
    });
    
    // Finalizar documento RTF
    const rtfFooter = '}';
    
    return rtfHeader + rtfContent + rtfFooter;
  };
  
  // Função para exportar para Word (usando RTF)
  const exportToWord = () => {
    // Criar documento RTF
    const rtfContent = createRTFDocument();
    
    // Criar um blob com o conteúdo RTF
    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    
    // Criar um link para download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.rtf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("Documento exportado com sucesso!");
  };
  
  // Alternativa: Criar documento Word usando HTML com estilos específicos
  const exportToWordAsHTML = () => {
    // Obter o conteúdo atual do editor
    const editorContent = editorRef.current ? editorRef.current.getContent() : content;
    
    // Remover metadados antes de processar
    const cleanContent = removeMetadata(editorContent);
    
    // Criar um elemento DOM temporário para manipular o HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanContent;
    
    // Aplicar estilos específicos para Word em todos os parágrafos
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      // Verificar se não é um parágrafo especial que não deve ter recuo
      if (!p.classList.contains('no-indent') && 
          !p.closest('table') && 
          !p.closest('li')) {
        // Aplicar estilo de parágrafo com recuo de primeira linha
        p.style.textIndent = '5cm';
        p.style.marginLeft = '0cm';
        p.style.marginRight = '0cm';
        p.style.textAlign = 'justify';
        p.setAttribute('class', 'MsoNormal');
      }
    });
    
    // Criar HTML específico para Word
    const wordHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          /* Estilo para Word */
          @page {
            size:21.0cm 29.7cm;
            margin:2.5cm 3.0cm 2.5cm 3.0cm;
            mso-header-margin:1.0cm;
            mso-footer-margin:1.0cm;
            mso-paper-source:0;
          }
          
          /* Estilo para parágrafos */
          p.MsoNormal {
            margin:0cm;
            margin-bottom:.0001pt;
            text-indent:5.0cm;
            line-height:115%;
            font-size:12.0pt;
            font-family:"Times New Roman",serif;
            text-align:justify;
          }
          
          /* Estilo para títulos */
          h1, h2, h3 {
            margin-top:12.0pt;
            margin-right:0cm;
            margin-bottom:6.0pt;
            margin-left:0cm;
            text-indent:0cm;
            line-height:115%;
            page-break-after:avoid;
            font-family:"Times New Roman",serif;
            text-align:center;
          }
          
          h1 {
            font-size:16.0pt;
          }
          
          h2 {
            font-size:14.0pt;
          }
          
          h3 {
            font-size:13.0pt;
          }
          
          /* Remover recuo de elementos específicos */
          table p, li p, .no-indent {
            text-indent:0cm !important;
          }
          
          /* Estilo para o corpo do documento */
          body {
            font-family:"Times New Roman",serif;
            font-size:12.0pt;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${tempDiv.innerHTML}
      </body>
      </html>
    `;
    
    // Criar um blob com o conteúdo HTML formatado para Word
    const blob = new Blob([wordHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    // Criar um link para download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("Documento Word exportado com sucesso!");
  };
  
  // Função para copiar como texto formatado para colar no Word
  const copyToClipboardForWord = () => {
    // Obter o conteúdo atual do editor
    const editorContent = editorRef.current ? editorRef.current.getContent() : content;
    
    // Remover metadados antes de processar
    const cleanContent = removeMetadata(editorContent);
    
    // Criar um elemento DOM temporário para manipular o HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanContent;
    
    // Aplicar estilos específicos para Word em todos os parágrafos
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      // Verificar se não é um parágrafo especial que não deve ter recuo
      if (!p.classList.contains('no-indent') && 
          !p.closest('table') && 
          !p.closest('li')) {
        // Aplicar estilo de parágrafo com recuo de primeira linha
        p.style.textIndent = '5cm';
        p.style.marginLeft = '0cm';
        p.style.marginRight = '0cm';
        p.style.textAlign = 'justify';
        p.setAttribute('class', 'MsoNormal');
      }
    });
    
    // Criar HTML específico para Word
    const wordHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          /* Estilo para Word */
          @page {
            size:21.0cm 29.7cm;
            margin:2.5cm 3.0cm 2.5cm 3.0cm;
            mso-header-margin:1.0cm;
            mso-footer-margin:1.0cm;
            mso-paper-source:0;
          }
          
          /* Estilo para parágrafos */
          p.MsoNormal {
            margin:0cm;
            margin-bottom:.0001pt;
            text-indent:5.0cm;
            line-height:115%;
            font-size:12.0pt;
            font-family:"Times New Roman",serif;
            text-align:justify;
          }
          
          /* Estilo para títulos */
          h1, h2, h3 {
            margin-top:12.0pt;
            margin-right:0cm;
            margin-bottom:6.0pt;
            margin-left:0cm;
            text-indent:0cm;
            line-height:115%;
            page-break-after:avoid;
            font-family:"Times New Roman",serif;
            text-align:center;
          }
          
          h1 {
            font-size:16.0pt;
          }
          
          h2 {
            font-size:14.0pt;
          }
          
          h3 {
            font-size:13.0pt;
          }
          
          /* Remover recuo de elementos específicos */
          table p, li p, .no-indent {
            text-indent:0cm !important;
          }
          
          /* Estilo para o corpo do documento */
          body {
            font-family:"Times New Roman",serif;
            font-size:12.0pt;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${tempDiv.innerHTML}
      </body>
      </html>
    `;
    
    // Criar um elemento textarea temporário para copiar o conteúdo
    const textarea = document.createElement('textarea');
    textarea.value = wordHTML;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      // Tentar copiar para a área de transferência
      document.execCommand('copy');
      alert("Conteúdo copiado para a área de transferência. Agora você pode colar diretamente no Word.");
    } catch (err) {
      console.error('Erro ao copiar para a área de transferência:', err);
      alert("Não foi possível copiar o conteúdo. Por favor, tente exportar o documento.");
    }
    
    document.body.removeChild(textarea);  
  };
  
  // Nova função para copiar conteúdo formatado para a área de transferência
  const copyFormattedContentToClipboard = () => {
    if (!editorRef.current) {
      alert("Editor não está pronto. Tente novamente.");
      return;
    }
    
    // Obter o conteúdo atual do editor
    const editorContent = editorRef.current.getContent();
    
    // Criar um elemento DOM temporário para remover metadados
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorContent;
    
    // Remover TODOS os elementos com a classe tese-metadata
    const metadataElements = tempDiv.querySelectorAll('.tese-metadata');
    metadataElements.forEach(element => {
      element.parentNode.removeChild(element);
    });
    
    // Remover também divs que podem conter metadados
    const metadataDivs = tempDiv.querySelectorAll('div[class*="metadata"], div[class*="meta-data"]');
    metadataDivs.forEach(element => {
      element.parentNode.removeChild(element);
    });
    
    // Definir o conteúdo limpo de volta no editor temporariamente
    editorRef.current.setContent(tempDiv.innerHTML);
    
    // Selecionar todo o conteúdo do editor
    editorRef.current.selection.select(editorRef.current.getBody(), true);
    
    // Copiar para a área de transferência
    editorRef.current.execCommand('copy');
    
    // Desselecionar
    editorRef.current.selection.collapse();
    
    // Restaurar o conteúdo original (se necessário)
    editorRef.current.setContent(editorContent);
    
    alert("Conteúdo formatado copiado! Agora abra o Word e cole com 'Manter formatação original'");
  };
  
  // Modificar a função handleSave para usar a nova função de salvamento
  const handleSave = () => {
    if (teses.length > 0 && teses[0].id) {
      // Se tiver uma tese selecionada, salve o texto
      saveTeseText();
    } else if (onSave) {
      // Se tiver uma função onSave, use-a (comportamento original)
      const editorContent = editorRef.current ? editorRef.current.getContent() : content;
      const cleanContent = removeMetadata(editorContent);
      
      onSave({
        title,
        content: cleanContent
      });
    } else {
      // Caso contrário, exporte para Word (comportamento original)
      exportToWord();
    }
  };
  
  // Função para importar documento Word
  const handleImportWord = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const options = {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Normal'] => p:fresh",
          "r[style-name='Strong'] => strong",
          "r[style-name='Emphasis'] => em"
        ],
        preserveDocumentStyle: true,
        includeDefaultStyleMap: true
      };
      
      const result = await mammoth.convertToHtml({ arrayBuffer }, options);
      
      if (editorRef.current) {
        // Processar o HTML resultante para melhorar a formatação
        const processedHtml = preserveFormatting(result.value);
        editorRef.current.setContent(processedHtml);
        setContent(processedHtml);
      }
    } catch (error) {
      console.error("Erro ao importar documento Word:", error);
      alert("Erro ao importar o documento. Por favor, tente novamente.");
    }
    
    // Limpar o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Função para obter o título da ação de IA
  const getAIActionTitle = (action) => {
    switch (action) {
      case 'resumir': return 'Resumo do Texto';
      case 'revisar': return 'Revisão do Texto';
      case 'sugerir': return 'Sugestões de Melhoria';
      case 'formatar': return 'Formatação ABNT';
      case 'citacao': return 'Citação ABNT';
      default: return 'Resultado da IA';
    }
  };
  
  return (
    <div className="document-editor">
      <div className="editor-header">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="document-title"
          placeholder="Título do documento"
        />
        
        <div className="editor-actions">
          <button 
            className="import-button" 
            onClick={() => fileInputRef.current.click()}
          >
            Importar do Word
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImportWord}
            accept=".docx"
            style={{ display: 'none' }}
          />
          
          {/* Botão de salvar para teses */}
          {teses.length > 0 && teses[0].id && (
            <button 
              className="save-button"
              onClick={saveTeseText}
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar Tese'}
            </button>
          )}
          
          <div className="ai-actions">
            <button 
              className="ai-button"
              onClick={() => handleAIAction('resumir')}
              title="Resumir o texto selecionado usando IA"
            >
              Resumir com IA
            </button>
            
            <button 
              className="ai-button"
              onClick={() => handleAIAction('revisar')}
              title="Revisar o texto selecionado usando IA"
            >
              Revisar Texto
            </button>
            
            <button 
              className="ai-button"
              onClick={() => handleAIAction('sugerir')}
              title="Obter sugestões de melhoria para o texto"
            >
              Sugestões de IA
            </button>
          </div>
          
          <button 
            className="save-button"
            onClick={copyFormattedContentToClipboard}
          >
            Copiar para Word
          </button>
          
          {/* Status de salvamento */}
          {saveStatus && (
            <span className="save-status">{saveStatus}</span>
          )}
        </div>
      </div>
      
      <div className="editor-container">
        {teses.length > 0 && (
          <div className="teses-info">
            {teses.length} tese(s) selecionada(s)
            {lastSaved && (
              <span className="last-saved-info">
                Última alteração salva: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
        
        <Editor
          onInit={handleEditorInit}
          value={content}
          initialValue="Carregando conteúdo..."
          onEditorChange={handleEditorChange}
          apiKey='5bn7it7ux14qyeitowmtunj9l9xx57o8tft3vm9qkdkaa439'
          init={{
            height: 600,
            menubar: true,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'paste'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic underline strikethrough forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | resumir revisar sugerir formatar citacao | help',
            content_style: `
              body { 
                font-family: 'Times New Roman', Times, serif !important; 
                font-size: 12pt !important; 
                line-height: 1.5; 
                padding: 20px;
              }
              p { 
                font-family: 'Times New Roman', Times, serif !important; 
                font-size: 12pt !important; 
                margin-bottom: 10pt; 
                text-align: justify;
                text-indent: 5cm !important;
              }
              /* Classes específicas para elementos sem recuo */
              h1, h2, h3, h4, h5, h6, 
              td, th, li, 
              .no-indent, 
              .tese-metadata p {
                text-indent: 0 !important;
              }
              h1 { 
                font-size: 16pt !important; 
                font-weight: bold; 
                margin-top: 24pt; 
                margin-bottom: 6pt; 
              }
              h2 { 
                font-size: 14pt !important; 
                font-weight: bold; 
                margin-top: 18pt; 
                margin-bottom: 6pt; 
              }
              h3 { 
                font-size: 13pt !important; 
                font-weight: bold; 
                margin-top: 16pt; 
                margin-bottom: 4pt; 
              }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin-bottom: 1em; 
              }
              td, th { 
                border: 1px solid black; 
                padding: 8pt;
              }
              ul, ol { 
                margin-bottom: 1em; 
                margin-left: 2em; 
              }
              li { 
                margin-bottom: 0.5em;
              }
              /* Classe específica para garantir o recuo de 5cm */
              .paragraph-indent-5cm {
                text-indent: 5cm !important;
              }
                /* Ocultar metadados */
              .tese-metadata {
                display: none !important;
              }
              [class*="metadata"] {
                display: none !important;
              }
            `,
            language: 'pt_BR',
            branding: false,
            paste_data_images: true,
            paste_retain_style_properties: 'all',
            paste_word_valid_elements: '*[*]',
            paste_enable_default_filters: false,
            paste_webkit_styles: 'all',
            paste_merge_formats: true,
            font_family_formats: 'Times New Roman=times new roman,times,serif',
            font_size_formats: '12pt',
            forced_root_block_attrs: {
              'style': 'font-family: \'Times New Roman\', Times, serif; font-size: 12pt; text-indent: 5cm !important; text-align: justify; line-height: 1.5;',
              'class': 'paragraph-indent-5cm'
            },
            setup: function(editor) {
              // Adicionar formatação padrão para novos parágrafos
              editor.on('NodeChange', function(e) {
                if (e.element.nodeName === 'P' && !e.element.classList.contains('no-indent')) {
                  editor.dom.setStyle(e.element, 'text-indent', '5cm');
                  editor.dom.addClass(e.element, 'paragraph-indent-5cm');
                }
              });
              
              // Adicionar formatação ao pressionar Enter
              editor.on('keydown', function(e) {
                if (e.keyCode === 13) {
                  setTimeout(function() {
                    const node = editor.selection.getNode();
                    if (node.nodeName === 'P' && !node.classList.contains('no-indent')) {
                      editor.dom.setStyle(node, 'text-indent', '5cm');
                      editor.dom.addClass(node, 'paragraph-indent-5cm');
                    }
                  }, 0);
                }
              });
              
              // Adicionar formatação após colar conteúdo
              editor.on('PastePostProcess', function(e) {
                const paragraphs = editor.dom.select('p', e.node);
                paragraphs.forEach(function(p) {
                  if (!p.classList.contains('no-indent')) {
                    editor.dom.setStyle(p, 'text-indent', '5cm');
                    editor.dom.addClass(p, 'paragraph-indent-5cm');
                  }
                });
              });
              
              // Remover metadados ao carregar conteúdo
              editor.on('BeforeSetContent', function(e) {
                // Remover elementos com classe tese-metadata
                e.content = e.content.replace(/<[^>]*class="[^"]*tese-metadata[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, '');
                e.content = e.content.replace(/<[^>]*class="[^"]*metadata[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, '');
              });
              
              // Adicionar evento para salvar automaticamente ao detectar alterações
              editor.on('Change', function() {
                // Se houver uma tese selecionada, programar um salvamento após 2 segundos de inatividade
                if (teses.length > 0 && teses[0].id) {
                  // Limpar qualquer temporizador existente
                  if (editor.saveTimer) {
                    clearTimeout(editor.saveTimer);
                  }
                  
                  // Configurar um novo temporizador
                  editor.saveTimer = setTimeout(() => {
                    saveTeseText();
                  }, 2000);
                }
              });
            }
          }}
        />
      </div>

      <AIResponseModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        result={aiResult}
        isProcessing={isAIProcessing}
        actionType={aiAction}
        onApply={applyAIResult}
      />
      
      {/* Instruções para o usuário */}
      <div className="export-instructions" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3 style={{ marginTop: '0' }}>Como obter o melhor resultado:</h3>
        <ol>
          <li>Clique no botão "Copiar para Word (Recomendado)" acima</li>
          <li>Abra um documento em branco no Microsoft Word</li>
          <li>Cole o conteúdo usando a opção "Manter formatação original" (Ctrl+V e depois selecione o ícone de opções de colagem)</li>
          <li>Se necessário, ajuste a formatação manualmente no Word</li>
        </ol>
        <p><strong>Nota:</strong> Esta abordagem preserva melhor o recuo de 5cm na primeira linha dos parágrafos.</p>
        
        <h3 style={{ marginTop: '15px' }}>Usando os recursos de IA:</h3>
        <ol>
          <li>Selecione o texto que deseja processar com a IA</li>
          <li>Clique em um dos botões de IA na barra de ferramentas:</li>
          <ul>
            <li><strong>Resumir com IA</strong> - Cria um resumo do texto selecionado</li>
            <li><strong>Revisar Texto</strong> - Corrige erros gramaticais e melhora a clareza</li>
            <li><strong>Sugestões de IA</strong> - Fornece sugestões para melhorar o texto</li>
            <li><strong>Formatar ABNT</strong> - Ajusta o texto para seguir as normas ABNT</li>
            <li><strong>Gerar Citação</strong> - Cria uma citação ABNT para o texto selecionado</li>
          </ul>
          <li>Revise o resultado gerado pela IA</li>
          <li>Clique em "Aplicar ao Texto" para substituir o texto selecionado ou adicionar o resultado ao documento</li>
        </ol>
      </div>
      
      {/* Adicionar CSS específico para garantir que o recuo seja aplicado corretamente */}
      <style jsx>{`
        /* Estilos adicionais para garantir a formatação correta */
        :global(.mce-content-body p) {
          text-indent: 5cm !important;
          font-family: 'Times New Roman', Times, serif !important;
          font-size: 12pt !important;
          text-align: justify;
          line-height: 1.5;
        }
        
        :global(.mce-content-body h1),
        :global(.mce-content-body h2),
        :global(.mce-content-body h3),
        :global(.mce-content-body h4),
        :global(.mce-content-body h5),
        :global(.mce-content-body h6),
        :global(.mce-content-body td),
        :global(.mce-content-body th),
        :global(.mce-content-body li),
        :global(.mce-content-body .no-indent),
        :global(.mce-content-body .tese-metadata p) {
          text-indent: 0 !important;
        }
        
        :global(.paragraph-indent-5cm) {
          text-indent: 5cm !important;
        }
        
        /* Estilo para o botão de exportar */
        .save-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 8px 16px;
          margin-left: 10px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .save-button:hover {
          background-color: #45a049;
        }
        
        .save-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        /* Estilo para status de salvamento */
        .save-status {
          margin-left: 10px;
          font-style: italic;
          color: #666;
        }
        
        .last-saved-info {
          margin-left: 10px;
          font-size: 12px;
          color: #666;
        }
        
        /* Estilo para opções de exportação */
        .export-options {
          display: flex;
          margin-left: 10px;
        }
        
        .export-option-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 6px 12px;
          margin-left: 5px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .export-option-button:hover {
          background-color: #2980b9;
        }
        
        /* Ocultar metadados */
        :global(.tese-metadata),
        :global([class*="metadata"]),
        :global([class*="meta-data"]) {
          display: none !important;
        }
        
        /* Estilo específico para o botão de cópia para Word */
        .copy-word-button {
          background-color: #2c3e50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          font-size: 14px;
          margin-left: 10px;
          display: inline-block;
        }
        
        .copy-word-button:hover {
          background-color: #1a252f;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        /* Estilos para botões de IA */
        .ai-button {
          background-color: #8e44ad;
          color: white;
          border: none;
          padding: 8px 16px;
          margin-left: 5px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        
        .ai-button:hover {
          background-color: #7d3c98;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .ai-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        
        /* Estilos para o modal de IA */
        .ai-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .ai-modal {
          background-color: white;
          border-radius: 8px;
          width: 80%;
          max-width: 800px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .ai-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          background-color: #8e44ad;
          color: white;
          border-radius: 8px 8px 0 0;
        }
        
        .ai-modal-header h3 {
          margin: 0;
          color: white;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: white;
        }
        
        .ai-modal-content {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
          max-height: 60vh;
        }
        
        .ai-loading {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 200px;
          color: #7f8c8d;
        }
        
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #8e44ad;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .ai-result {
          white-space: pre-wrap;
          line-height: 1.6;
          margin-bottom: 20px;
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
        }
        
        .ai-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .apply-button {
          background-color: #27ae60;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .apply-button:hover {
          background-color: #219653;
        }
        
        .cancel-button {
          background-color: #e74c3c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .cancel-button:hover {
          background-color: #c0392b;
        }
        
        /* Estilo para as instruções */
        .export-instructions {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .export-instructions h3 {
          margin-top: 0;
          color: #2c3e50;
        }
        
        .export-instructions ol {
          padding-left: 20px;
        }
        
        .export-instructions li {
          margin-bottom: 8px;
        }
        
        .export-instructions p {
          margin-bottom: 0;
        }
        
        /* Garantir que o editor-header seja flexível e responsivo */
        .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .editor-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        /* Ajustar largura do título do documento */
        .document-title {
          flex: 1;
          min-width: 300px;
          padding: 8px 12px;
          font-size: 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        /* Garantir que os botões sejam visíveis em telas menores */
        @media (max-width: 768px) {
          .editor-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .editor-actions {
            justify-content: center;
          }
          
          .document-title {
            width: 100%;
            margin-bottom: 10px;
          }
          
          .ai-actions {
            justify-content: center;
            margin-top: 10px;
          }
        }

        /* Estilo para informações sobre teses */
        .teses-info {
          margin-bottom: 10px;
          padding: 8px 12px;
          background-color: #f0f8ff;
          border-radius: 4px;
          border: 1px solid #b8daff;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>
    </div>
  );
}

export default DocumentEditor;