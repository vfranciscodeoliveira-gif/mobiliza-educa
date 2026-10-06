/* Exportação somente leitura. Selecione o banco do sistema Windows no SSMS.
   Execute com resultados em arquivo e salve a célula XML completa como .xml.
   Inclui somente ALUNO com turma e escola consistentes; não altera o Windows. */
SET NOCOUNT ON;
SELECT 1 AS versao, DB_NAME() AS banco,
 (SELECT * FROM dbo.tblEscola FOR XML PATH('registro'),ROOT('escolas'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblTurma FOR XML PATH('registro'),ROOT('turmas'),TYPE,ELEMENTS XSINIL),
 (SELECT p.* FROM dbo.tblParticipante p
  INNER JOIN dbo.tblTurma t ON t.idTurma=p.idTurma AND t.idEscola=p.idEscola
  INNER JOIN dbo.tblEscola e ON e.idEscola=t.idEscola
  WHERE UPPER(p.tipoParticipante)='ALUNO'
  FOR XML PATH('registro'),ROOT('alunos'),TYPE,ELEMENTS XSINIL)
FOR XML PATH('mobilizaWindowsAlunos'),TYPE;
