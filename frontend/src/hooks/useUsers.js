import { useEffect, useState } from "react";

import {
  getUsuarios
} from "../services/api";

export function useUsers(user) {

  const [usuarios, setUsuarios] =
    useState([]);

  const fetchUsers = async () => {

    try {

      const data =
        await getUsuarios();

      console.log(
        "usuarios:",
        data
      );

      setUsuarios(data);

    } catch (err) {

      console.error(
        "Error obteniendo usuarios:",
        err
      );
    }
  };

  useEffect(() => {

    if (!user) return;

    fetchUsers();

  }, [user]);

  return {
    usuarios,
    setUsuarios,
    fetchUsers
  };
}