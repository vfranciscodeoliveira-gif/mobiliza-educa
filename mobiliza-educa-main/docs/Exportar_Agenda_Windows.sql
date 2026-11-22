/* Mobiliza Educa: exportacao somente leitura, compativel com SQL Server 2012+.
   No SSMS, selecione o banco do Windows e execute.
   Clique no resultado XML e salve como Agenda_Windows.xml (UTF-8).
   Importe em Agendamentos de atendimento > Importar do Windows.
   Nao execute o script completo do backup no Firebase ou no banco de producao.
   Inclui ativos e inativos; a previa do site permite escolher quais importar.
*/
SET NOCOUNT ON;
SELECT
  1 AS [@versao],
  DB_NAME() AS [@banco],
  (SELECT idEscola, nome, cidade, ativo
   FROM dbo.tblEscola ORDER BY idEscola
   FOR XML PATH('escola'), ROOT('escolas'), TYPE),
  (SELECT idTurma, idEscola, descricao AS nome, anoLetivo,
          COALESCE(NULLIF(turno,''), periodo, '') AS turno, ativo
   FROM dbo.tblTurma ORDER BY idTurma
   FOR XML PATH('turma'), ROOT('turmas'), TYPE),
  (SELECT a.idAgenda, a.idEvento, a.idEscola, a.programa, a.titulo,
          a.unidadeEscolar, CONVERT(varchar(19),a.dataInicio,126) AS dataInicio,
          CONVERT(varchar(19),a.dataFim,126) AS dataFim, a.turno,
          a.quantidadeTurmas, a.publicoEstimado, a.responsavel,
          a.contatoEscola, a.telefone, a.endereco, a.status,
          a.prioridade, a.observacoes, a.ativo,
          (SELECT DISTINCT et.idTurma
           FROM dbo.tblEventoTurma et
           INNER JOIN dbo.tblTurma t ON t.idTurma=et.idTurma
           WHERE et.idEvento=a.idEvento AND t.idEscola=a.idEscola
           FOR XML PATH('vinculo'), ROOT('vinculos'), TYPE)
   FROM dbo.tblAgendaEvento a ORDER BY a.idAgenda
   FOR XML PATH('agendamento'), ROOT('agendamentos'), TYPE)
FOR XML PATH('mobilizaAgenda'), TYPE;
