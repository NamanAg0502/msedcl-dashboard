"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Consumer, Agent } from "@/types";
import {
  supabaseFetchConsumers,
  supabaseFetchAgents,
} from "@/lib/supabase/api";

interface DataContextType {
  consumers: Consumer[];
  agents: Agent[];
  isLoading: boolean;
  refreshConsumers: () => Promise<void>;
  refreshAgents: () => Promise<void>;
  updateConsumerLocal: (consumer: Consumer) => void;
  updateAgentLocal: (agent: Agent) => void;
  deleteAgentLocal: (agentId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [consumersData, agentsData] = await Promise.all([
        supabaseFetchConsumers(),
        supabaseFetchAgents(),
      ]);
      setConsumers(consumersData);
      setAgents(agentsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      if (error && typeof error === 'object' && 'message' in error) {
        console.error("Error details:", JSON.stringify(error, null, 2));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConsumers = async () => {
    try {
      const consumersData = await supabaseFetchConsumers();
      setConsumers(consumersData);
    } catch (error) {
      console.error("Failed to refresh consumers:", error);
    }
  };

  const refreshAgents = async () => {
    try {
      const agentsData = await supabaseFetchAgents();
      setAgents(agentsData);
    } catch (error) {
      console.error("Failed to refresh agents:", error);
    }
  };

  const updateConsumerLocal = (updatedConsumer: Consumer) => {
    setConsumers((prev) =>
      prev.map((c) => (c.id === updatedConsumer.id ? updatedConsumer : c))
    );
  };

  const updateAgentLocal = (updatedAgent: Agent) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a))
    );
  };

  const deleteAgentLocal = (agentId: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== agentId));
  };

  return (
    <DataContext.Provider
      value={{
        consumers,
        agents,
        isLoading,
        refreshConsumers,
        refreshAgents,
        updateConsumerLocal,
        updateAgentLocal,
        deleteAgentLocal,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};
