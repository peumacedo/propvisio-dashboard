import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit2, Save, X, FileText } from 'lucide-react';

interface DecisionRecord {
  id: string;
  date: string;
  decision: string;
  owners: string[];
  expectedImpact: string;
}

const availableOwners = [
  'João Silva',
  'Maria Santos',
  'Pedro Oliveira',
  'Ana Costa',
  'Carlos Ferreira',
  'Luciana Souza',
  'Roberto Lima',
  'Patricia Alves'
];

const mockDecisions: DecisionRecord[] = [
  {
    id: '1',
    date: '15/12/2024',
    decision: 'Aprovar mudança no cronograma de entrega das unidades do Bloco A',
    owners: ['João Silva', 'Maria Santos'],
    expectedImpact: 'Antecipação de 2 meses na entrega, melhoria no fluxo de caixa'
  },
  {
    id: '2',
    date: '10/12/2024',
    decision: 'Aumentar verba de marketing digital em 30% para Q1/2025',
    owners: ['Ana Costa', 'Carlos Ferreira'],
    expectedImpact: 'Acelerar vendas e reduzir estoque em 15%'
  },
  {
    id: '3',
    date: '05/12/2024',
    decision: 'Renegociar contrato com fornecedor de acabamentos',
    owners: ['Pedro Oliveira'],
    expectedImpact: 'Redução de 8% nos custos de construção'
  },
  {
    id: '4',
    date: '28/11/2024',
    decision: 'Implementar novo sistema de controle de qualidade',
    owners: ['Luciana Souza', 'Roberto Lima'],
    expectedImpact: 'Diminuir retrabalhos em 25% e melhorar satisfação do cliente'
  },
  {
    id: '5',
    date: '20/11/2024',
    decision: 'Aprovar contratação de consultoria para análise de mercado',
    owners: ['Patricia Alves', 'João Silva'],
    expectedImpact: 'Embasamento técnico para precificação de novos lançamentos'
  }
];

export function GovernancePanel() {
  const [decisions, setDecisions] = useState<DecisionRecord[]>(mockDecisions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDecision, setNewDecision] = useState<Partial<DecisionRecord>>({
    date: '',
    decision: '',
    owners: [],
    expectedImpact: ''
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${day}/${month}/${year}`;
  };

  const isValidDate = (dateString: string) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateString)) return false;
    
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  };

  const handleSaveNew = () => {
    if (!newDecision.date || !newDecision.decision || !newDecision.owners?.length || !newDecision.expectedImpact) {
      alert('Todos os campos são obrigatórios');
      return;
    }

    if (!isValidDate(newDecision.date)) {
      alert('Data inválida. Use o formato DD/MM/AAAA');
      return;
    }

    if (newDecision.decision.length > 200) {
      alert('Decisão deve ter no máximo 200 caracteres');
      return;
    }

    if (newDecision.expectedImpact.length > 200) {
      alert('Impacto esperado deve ter no máximo 200 caracteres');
      return;
    }

    const decision: DecisionRecord = {
      id: Date.now().toString(),
      date: newDecision.date!,
      decision: newDecision.decision!,
      owners: newDecision.owners!,
      expectedImpact: newDecision.expectedImpact!
    };

    setDecisions([decision, ...decisions]);
    setNewDecision({ date: '', decision: '', owners: [], expectedImpact: '' });
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSaveEdit = (id: string, updatedDecision: DecisionRecord) => {
    if (!isValidDate(updatedDecision.date)) {
      alert('Data inválida. Use o formato DD/MM/AAAA');
      return;
    }

    if (updatedDecision.decision.length > 200) {
      alert('Decisão deve ter no máximo 200 caracteres');
      return;
    }

    if (updatedDecision.expectedImpact.length > 200) {
      alert('Impacto esperado deve ter no máximo 200 caracteres');
      return;
    }

    setDecisions(decisions.map(d => d.id === id ? updatedDecision : d));
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const toggleOwner = (owner: string) => {
    const currentOwners = newDecision.owners || [];
    if (currentOwners.includes(owner)) {
      setNewDecision({
        ...newDecision,
        owners: currentOwners.filter(o => o !== owner)
      });
    } else {
      setNewDecision({
        ...newDecision,
        owners: [...currentOwners, owner]
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Registro de Decisões - Governança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Data</TableHead>
                  <TableHead className="font-bold">Decisão</TableHead>
                  <TableHead className="font-bold">Responsáveis</TableHead>
                  <TableHead className="font-bold">Impacto Esperado</TableHead>
                  <TableHead className="font-bold w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* New Decision Row */}
                <TableRow className="bg-primary/5 border-b-2 border-primary/20">
                  <TableCell>
                    <Input
                      placeholder="DD/MM/AAAA"
                      value={newDecision.date || ''}
                      onChange={(e) => setNewDecision({ ...newDecision, date: e.target.value })}
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      placeholder="Descrição da decisão (máx. 200 caracteres)"
                      value={newDecision.decision || ''}
                      onChange={(e) => setNewDecision({ ...newDecision, decision: e.target.value })}
                      className="min-h-[60px] resize-none"
                      maxLength={200}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {(newDecision.decision || '').length}/200
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Select onValueChange={toggleOwner}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOwners.map(owner => (
                            <SelectItem key={owner} value={owner}>
                              {owner}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-1">
                        {(newDecision.owners || []).map(owner => (
                          <Badge 
                            key={owner} 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => toggleOwner(owner)}
                          >
                            {owner} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Textarea
                      placeholder="Impacto esperado (máx. 200 caracteres)"
                      value={newDecision.expectedImpact || ''}
                      onChange={(e) => setNewDecision({ ...newDecision, expectedImpact: e.target.value })}
                      className="min-h-[60px] resize-none"
                      maxLength={200}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {(newDecision.expectedImpact || '').length}/200
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={handleSaveNew}
                      size="sm"
                      className="w-full"
                    >
                      <PlusCircle className="w-4 h-4 mr-1" />
                      Salvar
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Existing Decisions */}
                {decisions.map((decision) => (
                  <EditableDecisionRow
                    key={decision.id}
                    decision={decision}
                    isEditing={editingId === decision.id}
                    onEdit={() => handleEdit(decision.id)}
                    onSave={(updated) => handleSaveEdit(decision.id, updated)}
                    onCancel={handleCancelEdit}
                    availableOwners={availableOwners}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface EditableDecisionRowProps {
  decision: DecisionRecord;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (decision: DecisionRecord) => void;
  onCancel: () => void;
  availableOwners: string[];
}

function EditableDecisionRow({ 
  decision, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel,
  availableOwners 
}: EditableDecisionRowProps) {
  const [editData, setEditData] = useState<DecisionRecord>(decision);

  const toggleOwner = (owner: string) => {
    if (editData.owners.includes(owner)) {
      setEditData({
        ...editData,
        owners: editData.owners.filter(o => o !== owner)
      });
    } else {
      setEditData({
        ...editData,
        owners: [...editData.owners, owner]
      });
    }
  };

  if (isEditing) {
    return (
      <TableRow>
        <TableCell>
          <Input
            value={editData.date}
            onChange={(e) => setEditData({ ...editData, date: e.target.value })}
            className="w-32"
          />
        </TableCell>
        <TableCell>
          <Textarea
            value={editData.decision}
            onChange={(e) => setEditData({ ...editData, decision: e.target.value })}
            className="min-h-[60px] resize-none"
            maxLength={200}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {editData.decision.length}/200
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-2">
            <Select onValueChange={toggleOwner}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar responsável" />
              </SelectTrigger>
              <SelectContent>
                {availableOwners.map(owner => (
                  <SelectItem key={owner} value={owner}>
                    {owner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {editData.owners.map(owner => (
                <Badge 
                  key={owner} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => toggleOwner(owner)}
                >
                  {owner} ×
                </Badge>
              ))}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Textarea
            value={editData.expectedImpact}
            onChange={(e) => setEditData({ ...editData, expectedImpact: e.target.value })}
            className="min-h-[60px] resize-none"
            maxLength={200}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {editData.expectedImpact.length}/200
          </div>
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button
              onClick={() => onSave(editData)}
              size="sm"
              variant="default"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button
              onClick={onCancel}
              size="sm"
              variant="outline"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{decision.date}</TableCell>
      <TableCell>{decision.decision}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {decision.owners.map(owner => (
            <Badge key={owner} variant="outline">
              {owner}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>{decision.expectedImpact}</TableCell>
      <TableCell>
        <Button
          onClick={onEdit}
          size="sm"
          variant="ghost"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
