-- Exportação somente leitura — SQL Server 2012 ou superior.
-- Execute no banco ShowMilhaoTransito e salve o XML completo.
SELECT 3 AS versao, DB_NAME() AS banco,
 (SELECT * FROM dbo.tblAgendaEvento FOR XML PATH('registro'),ROOT('tblAgendaEvento'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblEvento FOR XML PATH('registro'),ROOT('tblEvento'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblEscola FOR XML PATH('registro'),ROOT('tblEscola'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblTurma FOR XML PATH('registro'),ROOT('tblTurma'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblEventoTurma FOR XML PATH('registro'),ROOT('tblEventoTurma'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblEventoTurmaOperacao FOR XML PATH('registro'),ROOT('tblEventoTurmaOperacao'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblAgendaChecklist FOR XML PATH('registro'),ROOT('tblAgendaChecklist'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblAgendaAlarme FOR XML PATH('registro'),ROOT('tblAgendaAlarme'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tabAgendaEscalaFuncionario FOR XML PATH('registro'),ROOT('tabAgendaEscalaFuncionario'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblAgendaCoberturaItemMobiliza FOR XML PATH('registro'),ROOT('tblAgendaCoberturaItemMobiliza'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblAgendaCoberturaMobiliza FOR XML PATH('registro'),ROOT('tblAgendaCoberturaMobiliza'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblAgendaEventoAuditoriaMobiliza FOR XML PATH('registro'),ROOT('tblAgendaEventoAuditoriaMobiliza'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblMobilizaDossieAcao360 FOR XML PATH('registro'),ROOT('tblMobilizaDossieAcao360'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblFilaEvento FOR XML PATH('registro'),ROOT('tblFilaEvento'),TYPE,ELEMENTS XSINIL),
 (SELECT * FROM dbo.tblEventoEncerramentoMobiliza FOR XML PATH('registro'),ROOT('tblEventoEncerramentoMobiliza'),TYPE,ELEMENTS XSINIL),
 (SELECT idTurma, COUNT(*) AS total FROM dbo.tblParticipante WHERE idTurma IS NOT NULL GROUP BY idTurma FOR XML PATH('registro'),ROOT('resumoParticipantesTurma'),TYPE,ELEMENTS XSINIL)
FOR XML PATH(''), ROOT('mobilizaWindowsIntegral'), TYPE;
