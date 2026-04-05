const express = require('express');
const app = express();

app.use(express.json());

let livros = [
{id: 1, titulo: "Alice no País das Maravilhas", autor: "Lewis Carroll", ano: 1865, genero: "Nonsense", nota: 5, fav: true, comentarios: [{id:1, texto:"Livro muito bom!"}]},
{id: 2, titulo: "Alice Através do Espelho", autor: "Lewis Carroll", ano: 1871, genero: "Nonsense", nota: 4.7, fav: false, comentarios: []},
{id: 3, titulo: "Wicked", autor: "Gregory Maguire", ano: 1995, genero: "Fantasia", nota: 4.2, fav: false, comentarios: []},
{id: 4, titulo: "O Pequeno Príncipe", autor: "Antoine de Saint-Exupéry", ano: 1943, genero: "Infanto-Juvenil", nota: 5, fav: false, comentarios: []},
{id: 5, titulo: "Percy Jackson e o Ladrão de Raios", autor: "Rick Riordan", ano: 2005, genero: "Fantasia", nota: 4.7, fav: false, comentarios: []},
{id: 6, titulo: "O Mágico de Oz", autor: "L. Frank Baum", ano: 1900, genero: "Fantasia", nota: 4.6, fav: false, comentarios: []},
{id: 7, titulo: "A Divina Comédia", autor: "Dante Alighieri", ano: 1321, genero: "Ficção", nota: 4.7, fav: true, comentarios: []},
{id: 8, titulo: "Memórias Póstumas de Brás Cubas", autor: "Machado de Assis", ano: 1881, genero: "Ficção", nota: 5, fav: false, comentarios: []},
{id: 9, titulo: "Dom Casmurro", autor: "Machado de Assis", ano: 1899, genero: "Ficção", nota: 4.9, fav: false, comentarios: []},
{id: 10, titulo: "Quincas Borba", autor: "Machado de Assis", ano: 1891, genero: "Ficção", nota: 4.8, fav: false, comentarios: []}
];

app.get('/api/livros', (req, res) => {
    const { genero, nota_min, ano_max, ano_min, ordem, direcao, pagina = 1, limite = 10 } = req.query;
    
    let resultado = livros;
    
    if (genero) resultado = resultado.filter(p => p.genero === genero);
    if (nota_min) resultado = resultado.filter(p => p.nota >= parseFloat(nota_min));
    if (ano_max) resultado = resultado.filter(p => p.ano <= parseFloat(ano_max));
    if (ano_min) resultado = resultado.filter(p => p.ano >= parseFloat(ano_min));
    
    if (ordem) {
        resultado = resultado.sort((a, b) => {
            if (ordem === 'nota') {
                return direcao === 'desc' ? b.nota - a.nota : a.nota - b.nota;
            }
            if (ordem === 'titulo') {
                return direcao === 'desc' ? b.titulo.localeCompare(a.titulo) : a.titulo.localeCompare(b.titulo);
            }
        });
    }
    
    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const inicio = (paginaNum - 1) * limiteNum;
    const paginado = resultado.slice(inicio, inicio + limiteNum);
    
    res.json({
        dados: paginado,
        paginacao: {
            pagina_atual: paginaNum,
            itens_por_pagina: limiteNum,
            total_itens: resultado.length,
            total_paginas: Math.ceil(resultado.length / limiteNum)
        }
    });
});

app.get('/api/livros/procurar/:id', (req, res) => {
    const livro = livros.find(p => p.id === parseInt(req.params.id));

    if (!livro) return res.status(404).json({ erro: "Livro não encontrado" });

    res.json(livro);
});

app.get('/api/livros/titulo/:titulo', (req, res) => {
    const livro = livros.find(p => p.titulo === req.params.titulo);

    if (!livro) return res.status(404).json({ erro: "Título não encontrado" });

    res.json(livro);
});

app.get('/api/livros/favoritos', (req, res) => {
    let favoritos = livros.filter(p => p.fav === true);

    if (favoritos.length === 0) return res.status(404).json({ erro: "Não há algum livro marcado como favorito" });

    res.status(201).json(favoritos)
});

let proximoId = 11;

app.post('/api/livros', (req, res) => {
    const { titulo, autor, ano, genero, nota } = req.body;

    if (!titulo || !autor || ano === undefined || !genero || nota === undefined) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios: titulo, autor, ano, genero, nota" });
    }

    if (ano>2026) return res.status(400).json({ erro: "Um livro não pode ter sido publicado nesse ano ainda" });
    if (nota<0 || nota>5) return res.status(400).json({ erro: "A nota deve estar entre 0 e 5" });

    const novoLivro = {
        id: proximoId++,
        titulo,
        autor,
        ano,
        genero,
        nota,
        fav: false,
        comentarios: []
    };
    
    livros.push(novoLivro);
    
    res.status(201).json(novoLivro);
});

app.post('/api/livros/duplicar', (req, res) => {
    const { id } = req.body;

    if (id === undefined) return res.status(400).json({ erro: "O campo é obrigatório: id" });
    
    const livro = livros.find(p => p.id === parseInt(id));

    if(!livro) return res.status(404).json({ erro: "Livro não encontrado" });
    
    novoLivro = {
        ...livro,
        id: proximoId++,
        titulo: livro.titulo + " Cópia",
        fav: false,
        comentarios: []
    };
    
    livros.push(novoLivro);
    
    res.status(201).json(novoLivro);
});

app.post('/api/livros/resetar-favoritos', (req, res) => {
    let livrosFavoritos = []
    for (let i=0; i<livros.length; i++){
        if (livros[i].fav){
            livros[i].fav = false
            livrosFavoritos.push(livros[i])
        }
    }
    if (livrosFavoritos.length === 0) return res.status(404).json({ erro: "Nenhum livro está favoritado" });
    res.status(201).json(livrosFavoritos);
});

app.post('/api/livros/adicionar-comentario/:id', (req, res) => {
    const { comentarioFeito } = req.body;

    if (!comentarioFeito) return res.status(400).json({ erro: "O campo é obrigatório: comentario" });

    const livroComentado = livros.find(p => p.id === parseInt(req.params.id));

    if (!livroComentado) return res.status(404).json({ erro: "Livro não encontrado" });

    const novoComentario = {
        id: livroComentado.comentarios.length+1,
        texto: comentarioFeito
    };

    livroComentado.comentarios.push(novoComentario);

    res.status(201).json({
        comentario: novoComentario,
        livro: livroComentado
    });
});

app.put('/api/livros/editar/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const livro = livros.find(p => p.id === id);

    if (!livro) return res.status(404).json({ erro: "Livro não encontrado" });

    const { titulo, autor, ano, genero, nota } = req.body;

    if (titulo) livro.titulo = titulo;
    if (autor) livro.autor = autor;
    if (ano !== undefined) livro.ano = ano;
    if (genero) livro.genero = genero;
    if (nota !== undefined) livro.nota = nota;

    res.status(200).json(livro);
});

app.patch('/api/livros/favoritar', (req, res) => {
    const { id } = req.body;

    if (id === undefined) return res.status(400).json({ erro: "O campo é obrigatório: id" });
    
    const livro = livros.find(p => p.id === parseInt(id));

    if(!livro) return res.status(404).json({ erro: "Livro não encontrado" });

    if (livro.fav === true) return res.status(404).json({ erro: "Livro já está favoritado" });
    
    livro.fav = true;
    
    res.status(200).json(livro);
});

app.patch('/api/livros/desfavoritar', (req, res) => {
    const { id } = req.body;

    if (id === undefined) return res.status(400).json({ erro: "O campo é obrigatório: id" });
    
    const livro = livros.find(p => p.id === parseInt(id));

    if(!livro) return res.status(404).json({ erro: "Livro não encontrado" });

    if (!livro.fav) return res.status(404).json({ erro: "Livro já não é favoritado" });

    livro.fav = false;

    res.status(200).json(livro)
});

app.delete('/api/livros/deletar', (req, res) => {
    const { id } = req.body;

    if (id === undefined) return res.status(400).json({ erro: "O campo é obrigatório: id" });

    const livroRemovido = livros.find(p => p.id === parseInt(id));

    if (!livroRemovido) return res.status(404).json({ erro: "Livro não encontrado" });

    livros = livros.filter(p => p.id !== parseInt(id));

    res.status(200).json(
        livroRemovido
    );
});

app.delete('/api/livros/deletar-nao-favoritos', (req, res) => {
    const livrosRemovidos = livros.filter(p => p.fav === false);

    if (!livrosRemovidos) return res.status(400).json({ erro: "Todos os livros estão favoritados" });

    livros = livros.filter(p => p.fav !== false);

    res.status(200).json(livrosRemovidos);
});

app.delete('/api/livros/deletar-comentarios', (req, res) => {
    const { id } = req.body;

    if(!id) return res.status(404).json({ erro: "O campo é obrigatório: id" })
    
    const livro = livros.find(p => p.id === id);

    if (!livro) return res.status(400).json({ erro: "Livro não encontrado" });

    if (livro.comentarios.length===0) return res.status(400).json({ erro: "O livro não tem comentários" });

    livro.comentarios = []

    res.status(200).json(livro);
});

app.delete('/api/livros/deletar-comentarios-por-id/:id', (req, res) => {
    const livro = livros.find(p => p.id === parseInt(req.params.id));

    if (!livro) return res.status(400).json({ erro: "Livro não encontrado" });

    const { id } = req.body;

    if (!livro) return res.status(404).json({ erro: "Livro não encontrado" });

    const comentarioRemovido = livro.comentarios.find(c => c.id === parseInt(id));

    if (!comentarioRemovido) return res.status(400).json({ erro: "Comentário não encontrado" });

    livro.comentarios = livro.comentarios.filter(c => c.id !== parseInt(id));

    res.status(200).json({
        comentario: comentarioRemovido,
        livro: livro
    });
});

app.listen(3000, () => console.log('API rodando na porta 3000'));