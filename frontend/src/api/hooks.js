import { useMutation, useQuery, useQueryClient } from 'react-query';
import client from './client';

export const useConnectDatabase = () => {
  const queryClient = useQueryClient();
  return useMutation((payload) => client.post('/connect-database', payload).then((res) => res.data), {
    onSuccess: () => {
      queryClient.invalidateQueries('schema');
    }
  });
};

export const useSchema = () => {
  return useQuery('schema', async () => {
    const res = await client.get('/schema');
    return res.data;
  }, {
    retry: false
  });
};

export const useUploadDocuments = () => {
  return useMutation(async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await client.post('/upload-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  });
};

export const useIngestionStatus = (jobId, enabled = false) => {
  return useQuery(['ingestion-status', jobId], async () => {
    const res = await client.get(`/ingestion-status/${jobId}`);
    return res.data;
  }, {
    enabled,
    refetchInterval: 1500
  });
};

export const useQueryHistory = () => {
  return useQuery('query-history', async () => {
    const res = await client.get('/query/history');
    return res.data ?? [];
  });
};

export const useSubmitQuery = () => {
  const queryClient = useQueryClient();
  return useMutation((payload) => client.post('/query', payload).then((res) => res.data), {
    onSuccess: () => {
      queryClient.invalidateQueries('query-history');
    }
  });
};
