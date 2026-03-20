"use client";

import { Card, CardBody } from "@heroui/card";
import { File } from "lucide-react";

interface FileEmptyStateProps {
  activeTab: string;
}
export default function FileEmptyState({ activeTab }: FileEmptyStateProps) {
  return (
    <Card className="border border-default-200 bg-default-50">
      <CardBody className="text-center py-16">
        <File className="h-16 w-16 mx-auto text-primary/50 mb-6">
          <h3 className="text-xl font-medium mb-2">{activeTab === "all" && "No files available"}</h3>
        </File>
      </CardBody>
    </Card>
  );
}
