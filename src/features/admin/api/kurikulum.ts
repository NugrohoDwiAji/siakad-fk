import axios from "axios";
import api from "@/lib/api/axios";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import type { KurikulumItem, KurikulumAngkatanItem, CreateKurikulumAngkatanRequest, CreateKurikulumAngkatanResponse, CreateNamaKurikulumRequest, CreateNamaKurikulumResponse } from "@/features/admin/types";

export async function getKurikulumStaff() {
  try {
    const response = await api.get("/api/staff/master-data/nama-kurikulum");
    console.log('ini response nama kurikulum',response.data);
    return successResponse<KurikulumItem[]>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function getKurikulumAngkatan() {
  try {
    const response = await api.get("/api/staff/master-data/kurikulum-angkatan");
    return successResponse<KurikulumAngkatanItem[]>(200, response.data.data);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function createKurikulumAngkatan(payload: CreateKurikulumAngkatanRequest) {
  try {
    const response = await api.post("/api/staff/master-data/kurikulum-angkatan", payload);
    return successResponse<CreateKurikulumAngkatanResponse["data"]>(200, response.data.data, response.data.message);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}

export async function createNamaKurikulum(payload: CreateNamaKurikulumRequest) {
  try {
    const response = await api.post("/api/staff/master-data/nama-kurikulum", payload);
    return successResponse<CreateNamaKurikulumResponse["data"]>(200, response.data.data, response.data.message);
  } catch (error) {
    let errorMessage = "Terjadi kesalahan pada server.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    return errorResponse(500, errorMessage);
  }
}
