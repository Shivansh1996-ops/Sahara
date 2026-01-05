"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Phone, ExternalLink } from "lucide-react";
import { HELPLINE_RESOURCES } from "@/lib/utils";

export function CrisisAlert() {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mx-4 mb-4"
    >
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800">
              You&apos;re not alone
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              If you&apos;re having thoughts of self-harm or suicide, please reach out to a crisis helpline. 
              Trained counselors are available 24/7.
            </p>
            
            <div className="mt-3 space-y-2">
              {HELPLINE_RESOURCES.slice(0, 2).map((resource) => (
                <a
                  key={resource.name}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-amber-800 hover:text-amber-900 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">{resource.name}:</span>
                  <span>{resource.phone}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
            
            <p className="text-xs text-amber-600 mt-3">
              I&apos;m an AI companion, not a mental health professional. 
              Please seek professional help if you&apos;re in crisis.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
