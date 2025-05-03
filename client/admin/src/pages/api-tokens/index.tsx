import React, { useState } from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    DeleteButton,
    CreateButton,
    useNotify,
    useRefresh,
    useCreate,
    useList, // Using useList to fetch data for the grid
} from 'react-admin'; // Assuming react-admin is the primary library based on common patterns
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField as MuiTextField, // Alias MUI TextField to avoid name clash
    Box,
    Typography,
    CircularProgress,
} from '@mui/material';

// Define the structure for the API token data expected from the backend (list view)
interface ApiTokenInfo {
    id: number;
    name: string; // Corresponds to TokenName in backend response
    userId: string;
    createdAt: string; // Corresponds to CreatedAt in backend response
}

// Define the structure for the newly created token (includes plain text token)
interface NewApiToken extends ApiTokenInfo {
    token: string; // The plain text token
}


// Component for the Create Token Dialog
const CreateTokenDialog = ({ open, onClose, onSuccess }) => {
    const [tokenName, setTokenName] = useState('');
    const notify = useNotify();
    const refresh = useRefresh();
    const [create, { isLoading }] = useCreate<NewApiToken>(
        'api-tokens', // The resource name matching the backend endpoint
        { name: tokenName }, // The data to send for creation
        {
            onSuccess: (data) => {
                onSuccess(data); // Pass the created token data (including plain text) to the parent
                notify('API Token created successfully. Copy the token now, it will not be shown again.', { type: 'success' });
                setTokenName(''); // Reset field
                refresh(); // Refresh the list view
                // Keep dialog open to show the token
            },
            onError: (error) => {
                notify(`Error creating token: ${error.message || 'Unknown error'}`, { type: 'warning' });
                onClose(); // Close dialog on error
            },
        }
    );

    const handleCreate = () => {
        if (!tokenName.trim()) {
            notify('Token name cannot be empty.', { type: 'warning' });
            return;
        }
        create();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Create New API Token</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Enter a descriptive name for your new API token.
                </DialogContentText>
                <MuiTextField
                    autoFocus
                    margin="dense"
                    id="tokenName"
                    label="Token Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    disabled={isLoading}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Component to display the newly created token
const ShowTokenDialog = ({ token, open, onClose }) => {
    const notify = useNotify();

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(token?.token || '')
            .then(() => notify('Token copied to clipboard!', { type: 'info' }))
            .catch(() => notify('Failed to copy token.', { type: 'warning' }));
    };

    if (!token) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md">
            <DialogTitle>API Token Created - Copy Your Token</DialogTitle>
            <DialogContent>
                <DialogContentText color="error" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Warning: This is the only time your token will be displayed.
                    Copy it now and store it securely. You will not be able to see it again.
                </DialogContentText>
                <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1, wordBreak: 'break-all', backgroundColor: '#f5f5f5' }}>
                    <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                        {token.token}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCopyToClipboard}>Copy to Clipboard</Button>
                <Button onClick={onClose} color="primary" autoFocus>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};


// Main component for the API Tokens page
export const ApiTokensList = () => {
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [newlyCreatedToken, setNewlyCreatedToken] = useState<NewApiToken | null>(null);
    const [isShowTokenDialogOpen, setShowTokenDialogOpen] = useState(false);

    // Use useList hook to fetch data for the Datagrid
    // react-admin automatically maps the 'id' field, which matches our backend response structure for GET /api-tokens
    const { data, isLoading, error } = useList<ApiTokenInfo>({ resource: 'api-tokens' });


     if (error) {
        return <Typography color="error">Error loading API tokens: {error.message}</Typography>;
    }

    const handleCreateSuccess = (tokenData: NewApiToken) => {
        setNewlyCreatedToken(tokenData);
        setCreateDialogOpen(false); // Close create dialog
        setShowTokenDialogOpen(true); // Open show token dialog
    };

    const handleShowTokenDialogClose = () => {
        setShowTokenDialogOpen(false);
        setNewlyCreatedToken(null); // Clear the token from state once dialog is closed
    };

    return (
        <List
            title="API Tokens"
            actions={
                <Box sx={{ mt: 2 }}>
                    <CreateButton
                        label="Create API Token"
                        onClick={() => setCreateDialogOpen(true)}
                    />
                </Box>
            }
            // Pass fetched data and loading state to the List component
            data={data}
            isLoading={isLoading}
            // Disable react-admin's default exporter as it might expose sensitive info inadvertently if columns change
            exporter={false}
            // Disable bulk actions for simplicity
            bulkActionButtons={false}
        >
            <Datagrid>
                {/* Use 'name' which corresponds to TokenName from the backend */}
                <TextField source="name" label="Token Name" />
                {/* Use 'createdAt' which corresponds to CreatedAt */}
                <DateField source="createdAt" label="Created At" showTime />
                {/* Delete button uses the 'id' field */}
                <DeleteButton
                    mutationMode="pessimistic" // Wait for backend confirmation
                    confirmTitle="Delete API Token"
                    confirmContent="Are you sure you want to delete this token? This action cannot be undone."
                />
            </Datagrid>

            {/* Dialog for Creating a Token */}
            <CreateTokenDialog
                open={isCreateDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* Dialog for Showing the Newly Created Token */}
            <ShowTokenDialog
                token={newlyCreatedToken}
                open={isShowTokenDialogOpen}
                onClose={handleShowTokenDialogClose}
            />
        </List>
    );
};

export default ApiTokensList;
