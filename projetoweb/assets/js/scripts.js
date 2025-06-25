// -----------------------------------
// Função para validar os formularios
// -----------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-receita');
  const camposObrigatorios = form.querySelectorAll('input[required], textarea[required], select[required]');
  const mensagem = document.getElementById('mensagem-feedback');

  function resetarErros() {
    camposObrigatorios.forEach(campo => {
      campo.classList.remove('is-invalid');
    });
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
    campo.classList.add('is-invalid'); // <-- ESSA linha aplica a borda vermelha
    valido = false;
  }
});

    if (valido) {
      form.reset();
      mostrarMensagemSucesso();
    }
  });

  camposObrigatorios.forEach(campo => {
    campo.addEventListener('input', () => {
      campo.classList.remove('is-invalid');
    });
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
    card.style.display = mostrar ? "block" : "none";
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

