#!/bin/bash

echo "=============================="
echo "🔹 VALIDACIÓN COMPLETA KUBERNETES"
echo "=============================="

NAMESPACE="gdd"
YAML_FILE="kubernetes.yaml"

# 1️⃣ Validación de sintaxis YAML (client)
echo -e "\n1️⃣ Validación de sintaxis YAML (client)"
kubectl apply --dry-run=client -f $YAML_FILE -n $NAMESPACE

# 2️⃣ Validación de sintaxis YAML (server)
echo -e "\n2️⃣ Validación de sintaxis YAML (server)"
kubectl apply --dry-run=server -f $YAML_FILE -n $NAMESPACE

# 3️⃣ Validar ConfigMap
echo -e "\n3️⃣ Validar ConfigMap"
kubectl get configmap backend-config -n $NAMESPACE -o yaml

# 4️⃣ Validar Secret API_KEY
echo -e "\n4️⃣ Validar Secret API_KEY"
kubectl get secret backend-secrets -n $NAMESPACE -o yaml

# 5️⃣ Validar Secret Docker registry
echo -e "\n5️⃣ Validar Secret Docker registry"
kubectl get secret nexus-cred -n $NAMESPACE -o yaml

# 6️⃣ Validar Deployment
echo -e "\n6️⃣ Validar Deployment"
kubectl get deployment backend-test -n $NAMESPACE -o yaml

# 7️⃣ Validar Pods
echo -e "\n7️⃣ Validar Pods (estado y detalles)"
kubectl get pods -n $NAMESPACE -o wide

# 8️⃣ Validar Service
echo -e "\n8️⃣ Validar Service"
kubectl get service backend-test -n $NAMESPACE -o yaml

echo -e "\n✅ Validación completa. Si no hay errores, ya puedes aplicar el YAML con seguridad."
