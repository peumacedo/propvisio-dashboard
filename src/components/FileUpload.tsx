import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { parseExcelData } from '@/utils/excel-parser';
import { ExcelData, SchemaValidation } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onDataLoaded: (data: ExcelData) => void;
  className?: string;
}

export function FileUpload({ onDataLoaded, className }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState<SchemaValidation | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setValidation(null);
    setUploadedFile(file);

    try {
      const data = await parseExcelData(file);
      onDataLoaded(data);
      
      // Simulate validation for demo
      setValidation({
        isValid: true,
        errors: [],
        warnings: [],
        missingColumns: []
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar arquivo';
      setError(errorMessage);
      setUploadedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      handleFileSelect(files[0]);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setValidation(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={cn("p-6 bg-executive-card border-border/50", className)}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-executive-text-primary">
            Upload de Dados
          </h3>
          <p className="text-sm text-executive-text-secondary">
            Faça upload da planilha Excel com os dados mensais
          </p>
        </div>

        {!uploadedFile ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              "border-border hover:border-brand-primary/50",
              "bg-gradient-to-br from-executive-bg to-muted/20"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 text-brand-primary/60">
                <FileSpreadsheet className="w-full h-full" />
              </div>
              
              <div className="space-y-2">
                <p className="text-executive-text-primary font-medium">
                  Arraste um arquivo Excel aqui ou clique para selecionar
                </p>
                <p className="text-sm text-executive-text-secondary">
                  Formatos aceitos: .xlsx, .xls
                </p>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="bg-brand-primary hover:bg-primary-hover text-primary-foreground"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Processando...' : 'Selecionar Arquivo'}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="font-medium text-executive-text-primary">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-executive-text-secondary">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {validation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-chart-positive" />
                  <span className="font-medium text-chart-positive">
                    Arquivo processado com sucesso
                  </span>
                </div>
                
                {validation.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Avisos encontrados:</p>
                        {validation.warnings.slice(0, 3).map((warning, index) => (
                          <p key={index} className="text-sm">
                            • {warning.message}
                          </p>
                        ))}
                        {validation.warnings.length > 3 && (
                          <p className="text-sm text-executive-text-secondary">
                            +{validation.warnings.length - 3} avisos adicionais
                          </p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick guide */}
        <div className="text-xs text-executive-text-secondary bg-muted/30 p-3 rounded border">
          <p className="font-medium mb-1">Estrutura esperada:</p>
          <p>• Aba "dados_mensais" com colunas: mes_ano, vgv, vendas_valor, fluxo_proj, fluxo_real</p>
          <p>• Aba "marcos_projeto" (opcional) com: marco, inicio, fim, status</p>
        </div>
      </div>
    </Card>
  );
}