"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sage-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-semibold text-slate-800 mb-3">
          Authentication Error
        </h1>
        
        <p className="text-slate-600 mb-6">
          We couldn&apos;t complete the sign-in process. This might happen if:
        </p>
        
        <ul className="text-left text-sm text-slate-500 mb-8 space-y-2 bg-slate-50 rounded-xl p-4">
          <li>• The authentication link expired</li>
          <li>• You cancelled the sign-in process</li>
          <li>• There was a temporary issue with the service</li>
        </ul>
        
        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <p className="text-xs text-slate-400 mt-6">
          If this problem persists, please try using email sign-in instead.
        </p>
      </motion.div>
    </div>
  );
}
