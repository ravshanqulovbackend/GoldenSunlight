"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCertificate, getAllAdminCertificates } from "@/lib/api/endpoints/adminCertificates";
import { revalidateCertificates } from "@/lib/actions/revalidateCertificates";
import { CertificateFormModal } from "@/components/admin/CertificateFormModal";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AppImage } from "@/components/ui/AppImage";
import { getImageUrl } from "@/lib/utils/image";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import type { Certificate } from "@/types/certificate";

export default function AdminCertificatesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: () => getAllAdminCertificates(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCertificate(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      await revalidateCertificates();
      toast("Certificate deleted", "success");
      setConfirmingId(null);
    },
    onError: (error) => toast(parseApiError(error).message || "An error occurred", "error"),
  });

  function openCreate() {
    setEditingCertificate(null);
    setModalOpen(true);
  }

  function openEdit(certificate: Certificate) {
    setEditingCertificate(certificate);
    setModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="headline-md text-on-surface">Certificates</h1>
          <p className="body-md text-on-surface-variant">
            Manage the certificates shown on the &quot;About Us&quot; page.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Icon name="add" className="text-[18px]" />
          New Certificate
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.length === 0 && (
        <EmptyState icon="workspace_premium" title="No certificates" description="Add your first certificate using the button above." />
      )}

      {data && data.length > 0 && (
        <Table>
          <Thead>
            <Tr>
              <Th>Image</Th>
              <Th>Name</Th>
              <Th>Issued By</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((certificate) => (
              <Tr key={certificate.id}>
                <Td>
                  <div className="h-10 w-10 overflow-hidden rounded-lg border border-outline-variant">
                    <AppImage src={getImageUrl(certificate.image)} alt={certificate.title} className="h-full w-full" />
                  </div>
                </Td>
                <Td>{certificate.title}</Td>
                <Td className="text-on-surface-variant">{certificate.issued_by || "—"}</Td>
                <Td>
                  <Badge tone={certificate.is_active ? "primary" : "neutral"}>
                    {certificate.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Td>
                <Td>
                  {confirmingId === certificate.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="label-sm text-on-surface-variant">Are you sure you want to delete this?</span>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(certificate.id)}
                      >
                        Yes
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>
                        No
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(certificate)}
                        aria-label="Edit"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                      >
                        <Icon name="edit" className="text-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(certificate.id)}
                        aria-label="Delete"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
                      >
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <CertificateFormModal open={modalOpen} onClose={() => setModalOpen(false)} certificate={editingCertificate} />
    </div>
  );
}
