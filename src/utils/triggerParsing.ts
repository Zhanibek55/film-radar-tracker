import { supabase } from "@/integrations/supabase/client";

export async function triggerMovieParsing() {
  try {
    const { data, error } = await supabase.functions.invoke('parse-movies', {
      body: { automated: true }
    });

    if (error) {
      console.error('Error triggering parsing:', error);
      throw error;
    }

    console.log('Parsing triggered successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to trigger parsing:', error);
    throw error;
  }
}