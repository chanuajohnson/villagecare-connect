import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Clipboard, Calendar, ArrowRight } from "lucide-react";
export function FamilyShortcutMenuBar() {
  return <div className="bg-muted py-2 border-y">
      <Container>
        <div className="flex items-center overflow-x-auto whitespace-nowrap py-1 gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Quick Access:</span>
          <Link to="/family/care-management">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Clipboard className="h-4 w-4" />
              <span>Care Management</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <Link to="/family/care-management/schedule">
            
          </Link>
        </div>
      </Container>
    </div>;
}