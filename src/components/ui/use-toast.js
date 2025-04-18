import { useToast } from './toast';

export { useToast };

export const toast = (props) => {
  const { toast } = useToast();
  return toast(props);
};
