export interface CuadroTarifario {
  nombre: 'T1-R' | 'T1-G' | 'T2-SMP' | 'T2-CMP' | 'T3-BT' | 'T3-MT' | 'TRA-SD';
  cargoVariableConsumoArsKWh: number;
  cargoVariableInyeccionArsKWh: number;
  tension: 'baja' | 'media' | 'alta';
}
