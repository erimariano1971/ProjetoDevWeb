// -----------------------------------
// Função para validar os formularios
// -----------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-receita');
  if (!form) return; // <- isso evita erro nas outras páginas
  const camposObrigatorios = form.querySelectorAll('input[required], textarea[required], select[required]');
  const mensagem = document.getElementById('mensagem-feedback');
  const imagemInput = document.getElementById('imagem');

  function resetarErros() {
    camposObrigatorios.forEach(campo => campo.classList.remove('is-invalid'));
  }

  function mostrarMensagemSucesso() {
    mensagem.classList.remove('d-none');
    mensagem.classList.add('show');
    setTimeout(() => {
      mensagem.classList.remove('show');
      mensagem.classList.add('d-none');
    }, 4000);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    resetarErros();

    let valido = true;
    camposObrigatorios.forEach(campo => {
      if (!campo.value.trim() || (campo.tagName === 'SELECT' && campo.value === 'Escolha...')) {
        campo.classList.add('is-invalid');
        valido = false;
      }
    });

    if (!valido) return;

    const dados = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      titulo: document.getElementById('titulo').value,
      categoria: document.getElementById('categoria').value,
      ingredientes: document.getElementById('ingredientes').value,
      preparo: document.getElementById('preparo').value,
      tempo: document.getElementById('tempo').value,
      porcoes: document.getElementById('porcoes').value,
      imagem: ''
    };

    if (imagemInput && imagemInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function () {
        dados.imagem = reader.result;
        salvarReceita(dados);
      };
      reader.readAsDataURL(imagemInput.files[0]);
    } else {
      salvarReceita(dados);
    }
  });

  function salvarReceita(receita) {
    const receitasSalvas = JSON.parse(localStorage.getItem('receitas')) || [];
    receitasSalvas.push(receita);
    localStorage.setItem('receitas', JSON.stringify(receitasSalvas));
    form.reset();
    mostrarMensagemSucesso();
  }

  camposObrigatorios.forEach(campo => {
    campo.addEventListener('input', () => campo.classList.remove('is-invalid'));
  });
});

 // ------------------------------------------------
 // Função da barra de busca e filtros de receitas
 // ------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {
  const formBusca = document.getElementById('form-busca');
  const barra = document.getElementById('barra-pesquisa');
  const botoesFiltro = document.querySelectorAll(".filtro-btn");
  const cards = document.querySelectorAll(".card-receita");
  let filtroAtivo = "todas";

  // Redireciona da home para receitas.html com o termo
  if (formBusca && barra) {
    formBusca.addEventListener('submit', function (e) {
      e.preventDefault();
      const termo = barra.value.trim();
      if (termo !== '') {
        window.location.href = `receitas.html?busca=${encodeURIComponent(termo)}`;
      }
    });
  }

  // Filtragem combinada (categoria + texto)
  function aplicarFiltros() {
  const termo = barra ? barra.value.toLowerCase() : "";
  let visiveis = 0;

  cards.forEach(card => {
    const categoria = card.getAttribute("data-categoria");
    const texto = card.textContent.toLowerCase();
    const correspondeCategoria = filtroAtivo === "todas" || categoria === filtroAtivo;
    const correspondeBusca = texto.includes(termo);

    const mostrar = correspondeCategoria && correspondeBusca;
    if (mostrar) {
     card.classList.remove("fade-out");
     card.classList.add("fade-in");
     card.style.display = "block";
    } else {
     card.classList.remove("fade-in");
     card.classList.add("fade-out");
     setTimeout(() => {
     card.style.display = "none";
     }, 300);
    }

    if (mostrar) visiveis++;
  });

  // Mostrar ou ocultar a mensagem
  const msg = document.getElementById('mensagem-nenhuma');
  if (msg) {
    msg.classList.toggle('d-none', visiveis > 0);
  }
}

  // Só ativa filtros se tiver cards
  if (cards.length > 0 && barra) {
    barra.addEventListener("input", aplicarFiltros);

    // Lê o termo da URL se vier com ?busca=...
    const params = new URLSearchParams(window.location.search);
    const termoURL = params.get('busca');
    if (termoURL) {
      barra.value = termoURL;
      aplicarFiltros(); // Aciona diretamente (evita falhas com eventos)
    }

    botoesFiltro.forEach(btn => {
      btn.addEventListener("click", () => {
        botoesFiltro.forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        filtroAtivo = btn.getAttribute("data-filtro");
        aplicarFiltros();
      });
    });
  }
});

// -----------------------------------
// Curtidas
// -----------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const botoesLike = document.querySelectorAll('.like-btn');

  botoesLike.forEach(btn => {
    btn.addEventListener('click', function () {
      const icone = this.querySelector('i');
      let likes = parseInt(this.dataset.likes);

      if (icone.classList.contains('bi-heart')) {
        icone.classList.replace('bi-heart', 'bi-heart-fill');
        icone.classList.add('text-danger');
        likes++;
      } else {
        icone.classList.replace('bi-heart-fill', 'bi-heart');
        icone.classList.remove('text-danger');
        likes--;
      }

      // Atualiza apenas o número depois do ícone
      this.dataset.likes = likes;
      const textoNode = document.createTextNode(` ${likes}`);
      this.innerHTML = '';
      this.appendChild(icone);
      this.appendChild(textoNode);

      this.classList.add('pulse');
      setTimeout(() => this.classList.remove('pulse'), 200);
    });
  });
});

// -----------------------------------
// Adiciona comentários
// -----------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-comentario');
  const nomeInput = document.getElementById('nome-comentario');
  const msgInput = document.getElementById('mensagem-comentario');
  const lista = document.getElementById('comentarios-lista');
  const chave = window.location.pathname; // Um identificador único por receita

  function renderizarComentarios() {
    const armazenados = JSON.parse(localStorage.getItem('comentarios_' + chave)) || [];
    lista.innerHTML = '';
    armazenados.forEach(({ nome, texto }, index) => {
  const div = document.createElement('div');
  div.className = 'border rounded p-3 mb-3';
  div.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <div><strong>${nome}:</strong> ${texto}</div>
      <button class="btn-close btn-sm apagar-comentario" data-index="${index}" title="Excluir"></button>
    </div>
    `;
     lista.appendChild(div);
    });
  }

  lista.addEventListener('click', function (e) {
  if (e.target.classList.contains('apagar-comentario')) {
    const index = parseInt(e.target.dataset.index);
    const chave = window.location.pathname;
    const comentarios = JSON.parse(localStorage.getItem('comentarios_' + chave)) || [];

    comentarios.splice(index, 1); // remove o comentário pelo índice
    localStorage.setItem('comentarios_' + chave, JSON.stringify(comentarios));
    renderizarComentarios(); // atualiza visualmente
  }
});

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const nome = nomeInput.value.trim();
    const texto = msgInput.value.trim();

    if (!nome || !texto) return;

    const novos = JSON.parse(localStorage.getItem('comentarios_' + chave)) || [];
    novos.push({ nome, texto });
    localStorage.setItem('comentarios_' + chave, JSON.stringify(novos));

    nomeInput.value = '';
    msgInput.value = '';
    renderizarComentarios();
  });

  renderizarComentarios();
});


// -----------------------------------
// Animações do site
// -----------------------------------

// Animações texto

document.addEventListener('DOMContentLoaded', function () {
  const animaveis = document.querySelectorAll('.texto-animado');

const observerTexto = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visivel');
      observerTexto.unobserve(entry.target);
    }
  });
});

animaveis.forEach(el => observerTexto.observe(el));

// Animação cards

const elementosAnimaveis = document.querySelectorAll('.texto-animado, .card-receita');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('card-receita')) {
          entry.target.classList.add('apareceu');
        } else {
          entry.target.classList.add('visivel');
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elementosAnimaveis.forEach(el => observer.observe(el));
});

// Transição entre pags 

document.body.classList.add('slide-entrando');

const linksPagina = document.querySelectorAll('a[href]:not([target])');

linksPagina.forEach(link => {
  const url = link.getAttribute('href');

  if (
    !url || 
    url.startsWith('#') || 
    url.startsWith('javascript') || 
    url.includes('mailto')
  ) return;

  link.addEventListener('click', function (e) {
    e.preventDefault();
    document.body.classList.add('slide-saindo');

    setTimeout(() => {
      window.location.href = url;
    }, 400); // tempo de transição
  });
});

// -----------------------------------
// ADD receitas no mural
// -----------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const mural = document.querySelector('.cards-receitas');

  if (!mural) return;

  const receitas = JSON.parse(localStorage.getItem('receitas')) || [];

  receitas.forEach((receita, index) => {
  const card = document.createElement('div');
  card.classList.add('card-receita', 'fade-in');
  card.setAttribute('data-categoria', receita.categoria.toLowerCase());
  card.style.display = 'block';

  const imagem = receita.imagem || 'assets/img/padrao.png';
  const resumo = receita.ingredientes.length > 60
    ? receita.ingredientes.slice(0, 60) + '...'
    : receita.ingredientes;

  card.innerHTML = `
    <img src="${imagem}" alt="${receita.titulo}">
    <div class="texto">
      <h3>${receita.titulo}</h3>
      <p>${resumo}</p>
      <button class="btn btn-sm btn-outline-danger apagar-receita mt-2" data-index="${index}">Apagar</button>
    </div>
  `;

  // 🗑️ Evento para apagar a receita
  card.querySelector('.apagar-receita').addEventListener('click', () => {
    receitas.splice(index, 1); // remove do array
    localStorage.setItem('receitas', JSON.stringify(receitas)); // salva novo estado
    card.remove(); // remove do DOM
  });

  mural.appendChild(card);
});

});