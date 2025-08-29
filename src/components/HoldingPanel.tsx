import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { ExcelData } from '@/types/dashboard';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/calculations';

interface HoldingPanelProps {
  projects: ExcelData[];
}

export function HoldingPanel({ projects }: HoldingPanelProps) {
  // Consolidate data from all projects
  const consolidatedFDC = projects.map(project => {
    const latestMonth = project.dados_mensais[project.dados_mensais.length - 1] || {
      vgv: 0,
      rentabilidade_perc: 0,
      avanco_fisico_perc: 0
    };
    const totalData = project.dados_mensais.reduce((acc, curr) => ({
      fluxo_proj: (acc.fluxo_proj || 0) + (curr.fluxo_proj || 0),
      fluxo_real: (acc.fluxo_real || 0) + (curr.fluxo_real || 0),
      contas_receber: (acc.contas_receber || 0) + (curr.contas_receber || 0),
      contas_pagar: (acc.contas_pagar || 0) + (curr.contas_pagar || 0),
      vendas_valor: (acc.vendas_valor || 0) + (curr.vendas_valor || 0),
    }), { fluxo_proj: 0, fluxo_real: 0, contas_receber: 0, contas_pagar: 0, vendas_valor: 0 });

    return {
      projeto: project.projeto_info?.nome || 'Projeto',
      versao: project.projeto_info?.versao || '1.0',
      vgv: project.projeto_info?.vgv || latestMonth.vgv || 0,
      vendas_acumuladas: totalData.vendas_valor,
      fluxo_projetado: totalData.fluxo_proj,
      fluxo_realizado: totalData.fluxo_real,
      contas_receber: totalData.contas_receber,
      contas_pagar: totalData.contas_pagar,
      rentabilidade: latestMonth.rentabilidade_perc || 0,
      avanco_fisico: latestMonth.avanco_fisico_perc || 0,
      perc_vendido: totalData.vendas_valor / (project.projeto_info?.vgv || latestMonth.vgv || 1) * 100
    };
  });

  const totalPortfolio = consolidatedFDC.reduce((acc, curr) => ({
    vgv_total: acc.vgv_total + curr.vgv,
    vendas_total: acc.vendas_total + curr.vendas_acumuladas,
    fluxo_proj_total: acc.fluxo_proj_total + curr.fluxo_projetado,
    fluxo_real_total: acc.fluxo_real_total + curr.fluxo_realizado,
    contas_receber_total: acc.contas_receber_total + curr.contas_receber,
    contas_pagar_total: acc.contas_pagar_total + curr.contas_pagar,
  }), { 
    vgv_total: 0, 
    vendas_total: 0, 
    fluxo_proj_total: 0, 
    fluxo_real_total: 0,
    contas_receber_total: 0,
    contas_pagar_total: 0
  });

  const dreConsolidated = [
    {
      categoria: 'Receitas Operacionais',
      subcategorias: [
        { nome: 'Vendas Imobiliárias', valor: totalPortfolio.vendas_total, tipo: 'receita' },
        { nome: 'Receitas Financeiras', valor: totalPortfolio.vendas_total * 0.02, tipo: 'receita' }
      ]
    },
    {
      categoria: 'Custos e Despesas',
      subcategorias: [
        { nome: 'Custo dos Imóveis Vendidos', valor: totalPortfolio.vendas_total * 0.65, tipo: 'custo' },
        { nome: 'Despesas Comerciais', valor: totalPortfolio.vendas_total * 0.08, tipo: 'custo' },
        { nome: 'Despesas Administrativas', valor: totalPortfolio.vendas_total * 0.05, tipo: 'custo' }
      ]
    },
    {
      categoria: 'Resultado Financeiro',
      subcategorias: [
        { nome: 'Receitas Financeiras', valor: totalPortfolio.fluxo_real_total * 0.01, tipo: 'receita' },
        { nome: 'Despesas Financeiras', valor: totalPortfolio.contas_pagar_total * 0.02, tipo: 'custo' }
      ]
    }
  ];

  const totalReceitas = dreConsolidated.reduce((acc, cat) => 
    acc + cat.subcategorias.filter(s => s.tipo === 'receita').reduce((sum, s) => sum + s.valor, 0), 0
  );
  
  const totalCustos = dreConsolidated.reduce((acc, cat) => 
    acc + cat.subcategorias.filter(s => s.tipo === 'custo').reduce((sum, s) => sum + s.valor, 0), 0
  );

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Visão Holding - Portfolio de Projetos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Carregue projetos para visualizar a consolidação holding.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">VGV Total Portfolio</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPortfolio.vgv_total)}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendas Realizadas</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPortfolio.vendas_total)}</p>
                <p className="text-xs text-green-600">
                  {formatPercentage(totalPortfolio.vendas_total / totalPortfolio.vgv_total)} do VGV
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fluxo Realizado</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPortfolio.fluxo_real_total)}</p>
                <p className="text-xs text-blue-600">
                  vs {formatCurrency(totalPortfolio.fluxo_proj_total)} proj.
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projetos Ativos</p>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-orange-600">
                  {projects.filter(p => p.dados_mensais.some(d => (d.avanco_fisico_perc || 0) < 100)).length} em execução
                </p>
              </div>
              <PieChart className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Portfolio de Projetos</TabsTrigger>
          <TabsTrigger value="fdc">Fluxo de Caixa Consolidado</TabsTrigger>
          <TabsTrigger value="dre">DRE Consolidada</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio de Projetos - Visão Executiva</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead className="text-right">VGV</TableHead>
                    <TableHead className="text-right">Vendas</TableHead>
                    <TableHead className="text-right">% Vendido</TableHead>
                    <TableHead className="text-right">Rentabilidade</TableHead>
                    <TableHead className="text-right">Avanço Físico</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consolidatedFDC.map((projeto, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{projeto.projeto}</TableCell>
                      <TableCell>
                        <Badge variant="outline">v{projeto.versao}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(projeto.vgv)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(projeto.vendas_acumuladas)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {formatPercentage(projeto.perc_vendido / 100)}
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${Math.min(projeto.perc_vendido, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatPercentage(projeto.rentabilidade / 100)}</TableCell>
                      <TableCell className="text-right">{formatPercentage(projeto.avanco_fisico / 100)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          projeto.avanco_fisico > 80 ? "default" : 
                          projeto.avanco_fisico > 20 ? "secondary" : "outline"
                        }>
                          {projeto.avanco_fisico > 80 ? "Finalização" : 
                           projeto.avanco_fisico > 20 ? "Em Execução" : "Lançamento"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fdc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Consolidado - Holding</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead className="text-right">Fluxo Projetado</TableHead>
                    <TableHead className="text-right">Fluxo Realizado</TableHead>
                    <TableHead className="text-right">Variação</TableHead>
                    <TableHead className="text-right">Contas a Receber</TableHead>
                    <TableHead className="text-right">Contas a Pagar</TableHead>
                    <TableHead className="text-right">Saldo Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consolidatedFDC.map((projeto, index) => {
                    const variacao = projeto.fluxo_realizado - projeto.fluxo_projetado;
                    const saldoLiquido = projeto.contas_receber - projeto.contas_pagar;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{projeto.projeto}</TableCell>
                        <TableCell className="text-right">{formatCurrency(projeto.fluxo_projetado)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(projeto.fluxo_realizado)}</TableCell>
                        <TableCell className={`text-right ${variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variacao >= 0 ? '+' : ''}{formatCurrency(variacao)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(projeto.contas_receber)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(projeto.contas_pagar)}</TableCell>
                        <TableCell className={`text-right font-medium ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(saldoLiquido)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="border-t-2 font-bold bg-muted/30">
                    <TableCell>TOTAL HOLDING</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalPortfolio.fluxo_proj_total)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalPortfolio.fluxo_real_total)}</TableCell>
                    <TableCell className={`text-right ${(totalPortfolio.fluxo_real_total - totalPortfolio.fluxo_proj_total) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(totalPortfolio.fluxo_real_total - totalPortfolio.fluxo_proj_total) >= 0 ? '+' : ''}
                      {formatCurrency(totalPortfolio.fluxo_real_total - totalPortfolio.fluxo_proj_total)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(totalPortfolio.contas_receber_total)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalPortfolio.contas_pagar_total)}</TableCell>
                    <TableCell className={`text-right font-bold ${(totalPortfolio.contas_receber_total - totalPortfolio.contas_pagar_total) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totalPortfolio.contas_receber_total - totalPortfolio.contas_pagar_total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dre" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DRE Consolidada - Visão Holding</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Subcategoria</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">% da Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dreConsolidated.map((categoria, catIndex) => (
                    <>
                      <TableRow key={catIndex} className="bg-muted/50 font-semibold">
                        <TableCell colSpan={4} className="font-bold text-sm uppercase tracking-wide">
                          {categoria.categoria}
                        </TableCell>
                      </TableRow>
                      {categoria.subcategorias.map((sub, subIndex) => (
                        <TableRow key={`${catIndex}-${subIndex}`}>
                          <TableCell></TableCell>
                          <TableCell className="pl-8">{sub.nome}</TableCell>
                          <TableCell className={`text-right ${sub.tipo === 'custo' ? 'text-red-600' : 'text-green-600'}`}>
                            {sub.tipo === 'custo' ? '(' : ''}{formatCurrency(sub.valor)}{sub.tipo === 'custo' ? ')' : ''}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatPercentage((sub.valor / totalReceitas))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                  
                  <TableRow className="border-t-2 font-bold bg-primary/10">
                    <TableCell colSpan={2} className="font-bold">RESULTADO LÍQUIDO</TableCell>
                    <TableCell className={`text-right font-bold text-lg ${(totalReceitas - totalCustos) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totalReceitas - totalCustos)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatPercentage((totalReceitas - totalCustos) / totalReceitas)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}