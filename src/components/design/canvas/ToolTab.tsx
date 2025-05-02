
import { ReactNode } from "react";
import { TabsContent } from "@/components/ui/tabs";

interface ToolTabProps {
  value: string;
  children: ReactNode;
}

const ToolTab = ({ value, children }: ToolTabProps) => {
  return (
    <TabsContent value={value} className="py-4">
      {children}
    </TabsContent>
  );
};

export default ToolTab;
