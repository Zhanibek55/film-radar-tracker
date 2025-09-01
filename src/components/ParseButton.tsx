import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, Loader2 } from "lucide-react";

export const ParseButton = ({ onParseComplete }: { onParseComplete?: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleParse = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('parse-movies', {
        body: {}
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Парсинг завершен",
        description: `Обработано ${data.processed_movies} фильмов и ${data.processed_episodes} эпизодов`,
      });

      onParseComplete?.();
    } catch (error) {
      console.error('Error parsing movies:', error);
      toast({
        title: "Ошибка парсинга",
        description: "Не удалось обновить базу данных фильмов",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleParse}
      disabled={isLoading}
      variant="default"
      className="bg-primary hover:bg-primary/90"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {isLoading ? "Парсинг..." : "Парсить сайты"}
    </Button>
  );
};