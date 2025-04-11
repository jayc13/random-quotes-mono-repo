export interface UseModalConfig {
    defaultVisible: boolean;
}
export declare const useModal: (config: UseModalConfig) => {
    visible: boolean;
    show: () => void;
    close: () => void;
    modalProps: {
        visible: boolean;
        onCancel: () => void;
    };
};
